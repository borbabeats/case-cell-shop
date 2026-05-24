import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Mapeamento de mensagens de validação do class-validator para português
const validationMessagesMap: Record<string, string> = {
  'should not be empty': 'não deve estar vazio',
  'must be a string': 'deve ser uma string',
  'must be a number': 'deve ser um número',
  'must be a positive number': 'deve ser um número positivo',
  'must be greater than or equal to': 'deve ser maior ou igual a',
  'must be one of the following values': 'deve ser um dos seguintes valores',
  'must be a UUID': 'deve ser um UUID válido',
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Log do erro
    this.logger.error(
      `HTTP Exception: ${status} - ${exception.message}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    const errorResponse: ErrorResponse = {
      error: {
        code: this.getErrorCode(status, exception),
        message: this.getErrorMessage(exception, exceptionResponse),
        details: this.getErrorDetails(exceptionResponse),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number, exception: HttpException): string {
    // Se a exceção já tiver um código customizado, use-o
    if (
      exception instanceof HttpException &&
      exception.getResponse() &&
      typeof exception.getResponse() === 'object'
    ) {
      const response = exception.getResponse() as any;
      if (response.error && typeof response.error === 'string') {
        return response.error;
      }
    }

    // Mapear códigos HTTP para códigos de erro
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  private getErrorMessage(
    exception: HttpException,
    exceptionResponse: any,
  ): string {
    // Se for BadRequestException com mensagens de validação
    if (exception instanceof BadRequestException && exceptionResponse) {
      const response = exceptionResponse;

      if (response.message) {
        if (Array.isArray(response.message)) {
          // Traduzir e limpar mensagens de validação
          const translatedMessages = response.message.map((msg: string) =>
            this.cleanValidationMessage(this.translateValidationMessage(msg)),
          );
          return translatedMessages.join(', ');
        }
        return this.cleanValidationMessage(
          this.translateValidationMessage(response.message),
        );
      }
    }

    if (
      exception instanceof HttpException &&
      exception.getResponse() &&
      typeof exception.getResponse() === 'object'
    ) {
      const response = exception.getResponse() as any;
      if (response.message && !Array.isArray(response.message)) {
        return this.cleanValidationMessage(
          this.translateValidationMessage(response.message),
        );
      }
    }

    return this.cleanValidationMessage(
      this.translateValidationMessage(exception.message),
    );
  }

  private cleanValidationMessage(message: string): string {
    // Remove prefixos como "shippingAddress.A", "items.0", etc.
    return message
      .replace(/^[a-zA-Z]+\.[a-zA-Z]+\s+/g, '') // Remove "shippingAddress.A " ou similares
      .replace(/^[a-zA-Z]+\.\d+\.\s+/g, '') // Remove "items.0. " ou similares
      .replace(/^\w+\.\w+\./g, '') // Remove qualquer prefixo com ponto
      .trim();
  }

  private translateValidationMessage(message: string): string {
    // Se a mensagem já estiver em português, retorna como está
    if (this.isPortuguese(message)) {
      return message;
    }

    // Traduz mensagens comuns do class-validator
    for (const [english, portuguese] of Object.entries(validationMessagesMap)) {
      if (message.includes(english)) {
        return message.replace(english, portuguese);
      }
    }

    return message;
  }

  private isPortuguese(message: string): boolean {
    const portugueseKeywords = [
      'não',
      'deve',
      'obrigatório',
      'inválido',
      'vazio',
      'maior',
    ];
    return portugueseKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword),
    );
  }

  private getErrorDetails(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message, error, statusCode, ...details } = exceptionResponse;
      if (Object.keys(details).length > 0) {
        return details;
      }
    }
    return undefined;
  }
}
