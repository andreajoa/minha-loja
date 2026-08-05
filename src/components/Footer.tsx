import Link from "next/link";
import { categories } from "@/data/products";

export default function Footer() {
  const menuCategories = categories.filter((category) => category !== "Todos").slice(0, 6);

  return (
    <footer className="bg-creme text-ardosia">
      <section className="bg-clay px-5 py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/65">Conteúdo e novidades</p>
          <h2 className="mt-3 font-display text-5xl">Receba escolhas mais conscientes no seu e-mail</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/72">
            Novos produtos, orientações de uso e conteúdos para ajudar você a ensinar primeiro e comprar com mais clareza.
          </p>
          <form action="/contato" method="get" className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="newsletter-email">Seu e-mail</label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="SEU E-MAIL"
              className="min-h-12 flex-1 border border-white/55 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/60 focus:border-white"
            />
            <button type="submit" className="min-h-12 bg-white px-8 text-xs font-bold uppercase tracking-[0.16em] text-ardosia hover:bg-oat">
              Quero receber
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <h3 className="font-display text-3xl">Comprar</h3>
          <ul className="mt-5 space-y-2 text-sm text-ardosia/65">
            <li><Link href="/colecoes" className="hover:text-coral">Todos os produtos</Link></li>
            {menuCategories.map((category) => (
              <li key={category}><Link href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="hover:text-coral">{category}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-3xl">Navegar</h3>
          <ul className="mt-5 space-y-2 text-sm text-ardosia/65">
            <li><Link href="/sobre" className="hover:text-coral">Nossa curadoria</Link></li>
            <li><Link href="/contato" className="hover:text-coral">Contato</Link></li>
            <li><Link href="/politicas/privacidade" className="hover:text-coral">Privacidade</Link></li>
            <li><Link href="/politicas/termos" className="hover:text-coral">Termos de serviço</Link></li>
            <li><Link href="/politicas/reembolso" className="hover:text-coral">Trocas e reembolso</Link></li>
            <li><Link href="/politicas/envio" className="hover:text-coral">Envio e entrega</Link></li>
          </ul>
        </div>

        <div className="lg:text-right">
          <h3 className="font-display text-3xl">Precisa de ajuda?</h3>
          <p className="mt-5 text-sm leading-6 text-ardosia/65">
            Atendimento de segunda a sexta, das 9h às 18h.<br />
            contato@brinqueteando.com.br
          </p>
          <p className="mt-6 text-sm leading-6 text-ardosia/65">
            Curadoria de <strong className="text-ardosia">Margareth Almeida</strong><br />
            Neuropsicopedagoga
          </p>
          <div className="mt-7 flex gap-4 lg:justify-end">
            <a href="https://www.instagram.com/neuromargarethapoio/" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-[0.16em] hover:text-coral">Instagram</a>
            <a href="https://www.tiktok.com/@neuromargarethapoio" target="_blank" rel="noreferrer" className="text-xs font-bold uppercase tracking-[0.16em] hover:text-coral">TikTok</a>
          </div>
        </div>
      </div>

      <div className="border-t border-ardosia/15 px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-xs text-ardosia/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BrinqueTEAndo. Todos os direitos reservados.</p>
          <p>Brinquedos e recursos pedagógicos com informação responsável.</p>
        </div>
      </div>
    </footer>
  );
}
