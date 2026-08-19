"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { formatPrice } from "@/data/products";

type Stats = {
  revenue: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number };
  averageTicket: number;
  totalProducts: number;
  lowStockProducts: { id: string; name: string; stock: number; category: string }[];
  categoryCount: Record<string, number>;
};

type Order = {
  id: string;
  created: number;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  items: { name: string; quantity: number; amount: number }[];
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-light">{sub}</p>}
    </div>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function load() {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/orders?limit=20"),
        ]);

        if (statsRes.status === 403 || ordersRes.status === 403) {
          setError("Acesso não autorizado. Apenas administradores podem acessar o dashboard.");
          setLoading(false);
          return;
        }

        if (!statsRes.ok || !ordersRes.ok) {
          setError("Erro ao carregar dados do dashboard.");
          setLoading(false);
          return;
        }

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();
        setStats(statsData);
        setOrders(ordersData.orders || []);
      } catch {
        setError("Erro de conexão ao carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isLoaded, isSignedIn]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Carregando...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="font-display text-2xl text-primary">Acesso restrito</p>
        <p className="text-sm text-text-light">Faça login para acessar o painel administrativo.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="font-display text-2xl text-primary">Acesso negado</p>
        <p className="text-sm text-text-light">{error}</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
          <p className="text-sm text-muted">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-7">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-primary">Painel Administrativo</h1>
        <p className="mt-1 text-sm text-text-light">Visão geral da loja BrinqueTEAndo</p>
      </div>

      {/* Resumo financeiro */}
      <section className="mb-10">
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-muted">Resumo financeiro</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Receita hoje" value={formatPrice(stats.revenue.today)} sub={`${stats.orders.today} pedido${stats.orders.today !== 1 ? "s" : ""}`} />
          <StatCard label="Receita da semana" value={formatPrice(stats.revenue.week)} sub={`${stats.orders.week} pedido${stats.orders.week !== 1 ? "s" : ""}`} />
          <StatCard label="Receita do mês" value={formatPrice(stats.revenue.month)} sub={`${stats.orders.month} pedido${stats.orders.month !== 1 ? "s" : ""}`} />
          <StatCard label="Ticket médio" value={formatPrice(stats.averageTicket)} sub={`${stats.totalProducts} produtos no catálogo`} />
        </div>
      </section>

      {/* Estoque crítico */}
      {stats.lowStockProducts.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-muted">
            Estoque crítico ({stats.lowStockProducts.length} produto{stats.lowStockProducts.length !== 1 ? "s" : ""})
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-background-alt/50">
                  <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-muted">Produto</th>
                  <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-muted">Categoria</th>
                  <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-muted">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border/20 last:border-0">
                    <td className="px-5 py-3 text-text">{product.name}</td>
                    <td className="px-5 py-3 text-text-light">{product.category}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`inline-flex min-w-[2rem] justify-center rounded-full px-2 py-0.5 text-xs font-bold ${product.stock <= 2 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {product.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mb-10">
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-muted">Produtos por categoria</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats.categoryCount).map(([cat, count]) => (
            <div key={cat} className="flex items-center justify-between rounded-xl border border-border/50 bg-white px-5 py-3 shadow-sm">
              <span className="text-sm font-medium text-text">{cat}</span>
              <span className="text-sm font-bold text-secondary">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Últimos pedidos */}
      <section>
        <h2 className="mb-4 text-[11px] font-black uppercase tracking-[0.14em] text-muted">Últimos pedidos</h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-border/50 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-muted">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-background-alt/50">
                    <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-muted">Data</th>
                    <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-muted">Cliente</th>
                    <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-[0.12em] text-muted">Itens</th>
                    <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-muted">Valor</th>
                    <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-[0.12em] text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/20 last:border-0">
                      <td className="whitespace-nowrap px-5 py-3 text-text-light">{formatDate(order.created)}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-text">{order.customerName}</p>
                        <p className="text-xs text-muted">{order.customerEmail}</p>
                      </td>
                      <td className="px-5 py-3 text-text-light">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {item.quantity}x {item.name}
                            {i < order.items.length - 1 && ", "}
                          </span>
                        ))}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-text">
                        {formatPrice(order.amount || 0)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                          {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
