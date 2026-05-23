import { IsArray, IsString, IsUUID, IsNumber, IsPositive, Min, IsEnum, ValidateNested, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CheckoutItemDto {
  @ApiProperty({ description: 'ID do produto (UUID)', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID(undefined, { message: 'O ID do produto deve ser um UUID válido' })
  productId: string;

  @ApiProperty({ description: 'Quantidade do item', example: 2, minimum: 1 })
  @IsNumber(undefined, { message: 'A quantidade deve ser um número' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero' })
  @Min(1, { message: 'A quantidade mínima é 1' })
  quantity: number;
}

class ShippingAddressDto {
  @ApiProperty({ description: 'Rua do endereço', example: 'Rua das Flores, 123' })
  @IsString({ message: 'A rua deve ser uma string' })
  @IsNotEmpty({ message: 'A rua do endereço é obrigatória' })
  street: string;

  @ApiProperty({ description: 'Cidade do endereço', example: 'Porto Alegre' })
  @IsString({ message: 'A cidade deve ser uma string' })
  @IsNotEmpty({ message: 'A cidade do endereço é obrigatória' })
  city: string;

  @ApiPropertyOptional({ description: 'Estado do endereço', example: 'RS' })
  @IsString({ message: 'O estado deve ser uma string' })
  @IsNotEmpty({ message: 'O estado do endereço é obrigatório' })
  state?: string;

  @ApiPropertyOptional({ description: 'CEP do endereço', example: '90120-000' })
  @IsString({ message: 'O CEP deve ser uma string' })
  @IsOptional()
  zipCode?: string;
}

export class CreateCheckoutDto {
  @ApiPropertyOptional({ description: 'ID do cliente (opcional)', example: 'cliente-123' })
  @IsString({ message: 'O ID do cliente deve ser uma string' })
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [CheckoutItemDto], description: 'Lista de itens do pedido' })
  @IsArray({ message: 'Os itens devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @ApiProperty({ type: ShippingAddressDto, description: 'Endereço de entrega' })
  @ValidateNested({ message: 'O endereço de entrega é obrigatório' })
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ description: 'Método de pagamento', enum: ['credit_card', 'pix', 'debito'], example: 'credit_card' })
  @IsEnum(['credit_card', 'pix', 'debito'], { message: 'O método de pagamento deve ser credit_card, pix ou debito' })
  paymentMethod: string;

  @ApiProperty({ description: 'Valor total do pedido', example: 50.00, minimum: 0.01 })
  @IsNumber(undefined, { message: 'O valor total deve ser um número' })
  @IsPositive({ message: 'O valor total deve ser maior que zero' })
  totalAmount: number;
}
