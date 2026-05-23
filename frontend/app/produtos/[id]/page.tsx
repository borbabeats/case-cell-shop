"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { productService } from "@/app/services/productService";
import { Product } from "@/app/types/product";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProdutoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "debit_card" | "pix">("credit_card");

  useEffect(() => {
    let active = true;
    setLoading(true);
    productService
      .getProductById(id)
      .then((res) => {
        if (!active) return;
        setProduct(res);
      })
      .catch(() => active && setError("Não foi possível carregar o produto."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  const handleBuy = () => {
    router.push(
      `/checkout?productId=${id}&quantity=${quantity}&paymentMethod=${paymentMethod}`
    );
  };

  if (loading) {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton variant="rectangular" height={500} className="!rounded-2xl" />
            <div className="space-y-4">
              <Skeleton height={60} />
              <Skeleton height={40} width="60%" />
              <Skeleton height={100} />
              <Skeleton height={50} width="40%" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
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
          <Alert severity="error">{error || "Produto não encontrado"}</Alert>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg">
                sem imagem
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <Typography variant="caption" className="!uppercase !tracking-wider !text-indigo-600 !font-semibold">
              {product.category}
            </Typography>
            <Typography variant="h4" className="!font-bold !mt-2">
              {product.name}
            </Typography>
            <Typography variant="body2" className="!text-slate-500 !mt-1">
              Cor: {product.color?.charAt(0).toUpperCase() + product.color?.slice(1)}
            </Typography>
            <Typography variant="h3" className="!font-bold !mt-4 !text-indigo-600">
              {BRL.format(product.price)}
            </Typography>

            <Typography variant="body1" className="!mt-6 !text-slate-700 leading-relaxed">
              {product.description}
            </Typography>

            <Typography variant="body2" className="!mt-4 !text-slate-500">
              Estoque disponível: {product.stock} unidades
            </Typography>

            <div className="mt-auto pt-8 space-y-6">
              {/* Quantity */}
              <div>
                <Typography variant="subtitle2" className="!font-semibold !mb-2">
                  Quantidade
                </Typography>
                <Select
                  size="small"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-white min-w-[120px]"
                >
                  {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map((q) => (
                    <MenuItem key={q} value={q}>
                      {q}
                    </MenuItem>
                  ))}
                </Select>
              </div>

              {/* Payment Method */}
              <div>
                <Typography variant="subtitle2" className="!font-semibold !mb-2">
                  Método de pagamento
                </Typography>
                <Stack direction="column" spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={paymentMethod === "credit_card"}
                        onChange={() => setPaymentMethod("credit_card")}
                      />
                    }
                    label="Cartão de crédito"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={paymentMethod === "debit_card"}
                        onChange={() => setPaymentMethod("debit_card")}
                      />
                    }
                    label="Cartão de débito"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={paymentMethod === "pix"}
                        onChange={() => setPaymentMethod("pix")}
                      />
                    }
                    label="PIX"
                  />
                </Stack>
              </div>

              {/* Buy Button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleBuy}
                disabled={product.stock === 0}
                className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-full !normal-case !py-3 !mt-4"
                startIcon={<ShoppingCartIcon />}
              >
                {product.stock === 0 ? "Produto indisponível" : "Comprar agora"}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
