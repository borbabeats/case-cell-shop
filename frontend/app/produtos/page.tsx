"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Rating,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import { productService } from "@/app/services/productService";
import { ProductCategory, ProductColor } from "@/app/types/product";
import { useRouter } from "next/navigation";

type Product = {
  id: string | number;
  name: string;
  price: number;
  color: string;
  image?: string;
  category?: string;
  rating?: number;
  description?: string;
  stock?: number;
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set());
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    setLoading(true);
    productService
      .getProducts({
        page,
        limit,
        name: query || undefined,
        category: category || undefined,
        color: color || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      })
      .then((res) => {
        if (!active) return;
        setProducts(res.data);
        setTotal(res.total);
      })
      .catch(() => active && setError("Não foi possível carregar os produtos."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, limit, query, category, color, minPrice, maxPrice]);


  const toggleFav = (id: string | number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-slate-200">
        <Container maxWidth="lg" className="!py-3 flex items-center justify-between">
          <Typography variant="h6" className="!font-bold tracking-tight">
            <span className="text-indigo-600">Lo</span>ja
          </Typography>
          <Tooltip title="Carrinho">
            <IconButton>
              <Badge badgeContent={cartCount} color="primary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_40%)]" />
        <Container maxWidth="lg" className="relative !py-16 text-white">
          <Chip
            label="Novidades da semana"
            size="small"
            className="!bg-white/20 !text-white !backdrop-blur"
          />
          <Typography variant="h3" className="!font-extrabold !mt-4 !tracking-tight">
            Nossos produtos
          </Typography>
          <Typography className="!mt-2 !text-white/85 max-w-xl">
            Selecionados a dedo. Frete grátis nas compras acima de R$ 199.
          </Typography>
          <Stack direction="row" spacing={1} className="!mt-5" sx={{ alignItems: 'center' }}>
            <LocalShippingIcon fontSize="small" />
            <Typography variant="body2" className="!text-white/90">
              Entrega expressa em todo o Brasil
            </Typography>
          </Stack>
        </Container>
      </section>

      <Container maxWidth="lg" className="!py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
          <TextField
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos..."
            size="small"
            className="md:w-96 bg-white rounded-lg"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={2}>
            <Select
              size="small"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white min-w-[140px]"
              displayEmpty
            >
              <MenuItem value="">Todas categorias</MenuItem>
              {Object.values(ProductCategory).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="bg-white min-w-[140px]"
              displayEmpty
            >
              <MenuItem value="">Todas cores</MenuItem>
              {Object.values(ProductColor).map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
            <TextField
              size="small"
              type="number"
              placeholder="Min preço"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-white min-w-[100px]"
            />
            <TextField
              size="small"
              type="number"
              placeholder="Max preço"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-white min-w-[100px]"
            />
          </Stack>
        </div>

        {error && (
          <Alert severity="error" className="!mb-6">
            {error}
          </Alert>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white p-3 shadow-sm">
                <Skeleton variant="rectangular" height={200} className="!rounded-xl" />
                <Skeleton className="!mt-3" width="70%" />
                <Skeleton width="40%" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Box className="text-center py-20 text-slate-500">
            <Typography variant="h6">Nenhum produto encontrado</Typography>
            <Typography variant="body2">Tente outra busca ou categoria.</Typography>
          </Box>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => {
              const fav = favorites.has(p.id);
              const lowStock = (p.stock ?? 99) <= 5;
              return (
                <article
                  key={p.id}
                  className="group relative flex flex-col rounded-2xl bg-white overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                        sem imagem
                      </div>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => toggleFav(p.id)}
                      className="!absolute !top-2 !right-2 !bg-white/80 hover:!bg-white"
                    >
                      {fav ? (
                        <FavoriteIcon fontSize="small" className="!text-rose-500" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                    {lowStock && (
                      <Chip
                        size="small"
                        label="Últimas unidades"
                        className="!absolute !top-2 !left-2 !bg-rose-500 !text-white"
                      />
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    {p.category && (
                      <Typography
                        variant="caption"
                        className="!uppercase !tracking-wider !text-indigo-600 !font-semibold"
                      >
                        {p.category}
                      </Typography>
                    )}
                    <Typography className="!font-semibold !mt-1 line-clamp-2">
                      {p.name}
                    </Typography>
                    <Typography variant="body2" className="!text-slate-500 !mt-1">
                      {p.color?.charAt(0).toUpperCase() + p.color?.slice(1)}
                    </Typography>
                    {typeof p.rating === "number" && (
                      <Stack direction="row" spacing={0.5} className="!mt-1" sx={{ alignItems: 'center' }}>
                        <Rating value={p.rating} precision={0.5} size="small" readOnly />
                        <Typography variant="caption" className="!text-slate-500">
                          ({p.rating.toFixed(1)})
                        </Typography>
                      </Stack>
                    )}

                    <div className="mt-auto pt-4 flex items-end justify-between">
                      <div>
                        <Typography variant="caption" className="!text-slate-500">
                          a partir de
                        </Typography>
                        <Typography variant="h6" className="!font-bold !leading-tight">
                          {BRL.format(p.price)}
                        </Typography>
                      </div>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => router.push(`/produtos/${p.id}`)}
                        className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-full !normal-case !px-4"
                        startIcon={<ShoppingCartIcon />}
                      >
                        Comprar
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="flex flex-col items-center gap-4 mt-10">
            <div className="text-sm text-slate-500">
              {total} {total === 1 ? "produto" : "produtos"} encontrados
            </div>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              <Button
                size="small"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                variant="outlined"
              >
                Anterior
              </Button>
              <Typography variant="body2">
                Página {page} de {Math.ceil(total / limit)}
              </Typography>
              <Button
                size="small"
                disabled={page >= Math.ceil(total / limit)}
                onClick={() => setPage((p) => p + 1)}
                variant="outlined"
              >
                Próxima
              </Button>
            </Stack>
          </div>
        )}
      </Container>
    </div>
  );
}
