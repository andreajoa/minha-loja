import Link from "next/link";
import { categories } from "@/data/products";
import FooterAnimals from "@/components/FooterAnimals";
import NewsletterForm from "@/components/NewsletterForm";

export default function Footer() {
  const menuCategories = categories
    .filter((category) => category !== "Todos")
    .slice(0, 6);

  return (
    <footer className="bg-background text-primary">
      <section className="relative overflow-hidden bg-secondary px-5 py-16 text-center text-white sm:py-20">
        <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full border border-white/15" />
        <div className="absolute -bottom-24 right-12 h-64 w-64 rounded-full bg-primary/12" />
        <div className="absolute right-[18%] top-10 animate-sparkle text-3xl text-secondary-light" aria-hidden="true">✦</div>
        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/70">Conteúdo e novidades</p>
          <h2 className="mt-3 font-display text-5xl">Receba escolhas mais conscientes no seu e-mail</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/78">
            Novos produtos, orientações de uso, promoções e cupons para ajudar você a ensinar primeiro e comprar com mais clareza.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.3fr]">
        <div>
          <h3 className="font-display text-3xl">Comprar</h3>
          <ul className="mt-5 space-y-2 text-sm text-text-light">
            <li><Link href="/colecoes" className="hover:text-secondary">Todos os produtos</Link></li>
            {menuCategories.map((category) => (
              <li key={category}><Link href={`/colecoes?categoria=${encodeURIComponent(category)}`} className="hover:text-secondary">{category}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-3xl">Navegar</h3>
          <ul className="mt-5 space-y-2 text-sm text-text-light">
            <li><Link href="/sobre" className="hover:text-secondary">Nossa curadoria</Link></li>
            <li><Link href="/contato" className="hover:text-secondary">Contato</Link></li>
            <li><Link href="/politicas/privacidade" className="hover:text-secondary">Privacidade</Link></li>
            <li><Link href="/politicas/termos" className="hover:text-secondary">Termos de serviço</Link></li>
            <li><Link href="/politicas/reembolso" className="hover:text-secondary">Trocas e reembolso</Link></li>
            <li><Link href="/politicas/envio" className="hover:text-secondary">Envio e entrega</Link></li>
          </ul>
        </div>

        <div className="lg:text-right">
          <div className="inline-flex items-center gap-3 rounded-full bg-background-alt px-4 py-2">
            <span className="animate-bob text-xl" aria-hidden="true">♡</span>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-secondary">Atendimento humanizado</p>
          </div>
          <h3 className="mt-4 font-display text-3xl">Precisa de ajuda?</h3>
          <p className="mt-5 text-sm leading-6 text-text-light">
            Atendimento de segunda a sexta, das 9h às 18h.<br />
            <a href="mailto:info@brinqueteando.online" className="font-bold text-secondary hover:underline">
              info@brinqueteando.online
            </a>
          </p>
          <p className="mt-6 text-sm leading-6 text-text-light">
            Curadoria de <strong className="text-primary">Margareth Almeida</strong><br />
            Neuropsicopedagoga
          </p>
          <div className="mt-7 flex gap-4 lg:justify-end">
            <a href="https://www.instagram.com/neuromargarethapoio/" target="_blank" rel="noreferrer" className="nav-link text-xs font-black uppercase tracking-[0.16em] hover:text-secondary">Instagram</a>
            <a href="https://www.tiktok.com/@neuromargarethapoio" target="_blank" rel="noreferrer" className="nav-link text-xs font-black uppercase tracking-[0.16em] hover:text-secondary">TikTok</a>
          </div>
        </div>
      </div>

      <FooterAnimals />
    </footer>
  );
}
