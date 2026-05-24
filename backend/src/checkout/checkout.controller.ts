import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido de checkout' })
  @ApiBody({ type: CreateCheckoutDto })
  @ApiResponse({ status: 200, description: 'Pagamento realizado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Erro de validação ou estoque insuficiente',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async create(@Body() createCheckoutDto: CreateCheckoutDto) {
    try {
      const result =
        await this.checkoutService.createCheckout(createCheckoutDto);
      return {
        statusCode: HttpStatus.OK,
        ...result,
      };
    } catch (error) {
      throw error;
    }
  }
}
