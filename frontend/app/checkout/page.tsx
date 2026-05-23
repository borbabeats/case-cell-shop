"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  Container,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { checkoutService } from "@/app/services/checkoutService";
import { productService } from "@/app/services/productService";
import { CheckoutResponse } from "@/app/types/checkout";
import { Product } from "@/app/types/product";

const REDIRECT_DELAY_MS = 5000;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const quantity = searchParams.get("quantity");
  const paymentMethod = searchParams.get("paymentMethod") || "credit_card";

  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CheckoutResponse | null>(null);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS / 1000);
  const [product, setProduct] = useState<Product | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  useEffect(() => {
    if (!productId) {
      setError("Produto não especificado");
      setFetchingProduct(false);
      return;
    }

    setFetchingProduct(true);
    productService
      .getProductById(productId)
      .then((res) => {
        setProduct(res);
      })
      .catch(() => setError("Não foi possível carregar o produto"))
      .finally(() => setFetchingProduct(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !quantity || !productId) return;

    setLoading(true);
    setError(null);

    try {
      const totalAmount = product.price * parseInt(quantity);
      const response = await checkoutService.createCheckout({
        customerId,
        items: [
          {
            productId,
            quantity: parseInt(quantity),
          },
        ],
        shippingAddress: {
          street,
          city,
          state,
          zipCode,
        },
        paymentMethod: paymentMethod as any,
        totalAmount,
      });
      setSuccess(response);

      let remaining = REDIRECT_DELAY_MS / 1000;
      const interval = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 1000);

      setTimeout(() => {
        router.push("/produtos");
      }, REDIRECT_DELAY_MS);
    } catch (err: any) {
      const message = err?.error?.message || "Erro ao processar o pagamento. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <CircularProgress />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
        <Container maxWidth="lg" className="!py-8">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            className="!mb-6"
          >
            Voltar
          </Button>
          <Alert severity="error">{error}</Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
        <Container maxWidth="lg" className="!py-3 flex items-center justify-between">
          <Typography variant="h6" className="!font-bold tracking-tight">
            <span className="text-indigo-600">Lo</span>ja
          </Typography>
        </Container>
      </header>

      <Container maxWidth="lg" className="!py-8">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          className="!mb-6"
        >
          Voltar para produtos
        </Button>

        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardContent className="!p-8">
            <Typography variant="h5" component="h1" className="!mb-6 !font-semibold">
              Finalizar Compra
            </Typography>

            {product && (
              <Box className="!mb-6 !p-4 !bg-slate-50 !rounded-lg">
                <Typography variant="subtitle1" className="!font-semibold">
                  {product.name}
                </Typography>
                <Typography variant="body2" className="!text-slate-600">
                  Quantidade: {quantity} | Preço unitário: R$ {product.price.toFixed(2)}
                </Typography>
                <Typography variant="h6" className="!mt-2 !text-indigo-600">
                  Total: R$ {(product.price * (quantity ? parseInt(quantity) : 1)).toFixed(2)}
                </Typography>
              </Box>
            )}

            {success ? (
              <Box className="flex flex-col gap-3">
                <Alert severity="success">
                  <Typography variant="subtitle1" className="!font-semibold">
                    {success.message}
                  </Typography>
                  <Typography variant="body2">
                    Pedido: {success.orderNumber} | Valor: R$ {success.totalAmount.toFixed(2)}
                  </Typography>
                </Alert>
                <Typography variant="body2" className="text-gray-600 text-center">
                  Redirecionando para a página de produtos em {countdown}s...
                </Typography>
                <CircularProgress size={24} className="!mx-auto" />
              </Box>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Typography variant="subtitle2" className="!font-semibold !mt-2">
                  Endereço de Entrega
                </Typography>
                <TextField
                  label="Rua"
                  fullWidth
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Cidade"
                    fullWidth
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <TextField
                    label="Estado"
                    fullWidth
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="RS"
                  />
                </Stack>
                <TextField
                  label="CEP"
                  fullWidth
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="90120-000"
                />

                {error && <Alert severity="error">{error}</Alert>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={18} color="inherit" />}
                  className="!bg-indigo-600 hover:!bg-indigo-700"
                >
                  {loading ? "Processando..." : "Finalizar pagamento"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
