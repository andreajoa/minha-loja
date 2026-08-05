import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ardosia text-creme">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-bold text-amarelo">BrinqueTEAndo</h3>
          <p className="text-sm opacity-80">
            Brinquedos e recursos pedagogicos para criancas atipicas, com TDAH e autismo.
          </p>
          <p className="mt-3 text-sm opacity-80">
            Curadoria de <strong>Margareth Almeida</strong><br />Neuropsicopedagoga
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Institucional</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/sobre" className="hover:text-amarelo">Sobre nos</Link></li>
            <li><Link href="/contato" className="hover:text-amarelo">Contato</Link></li>
            <li><Link href="/colecoes" className="hover:text-amarelo">Coleçoes</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Politicas</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link href="/politicas/privacidade" className="hover:text-amarelo">Privacidade</Link></li>
            <li><Link href="/politicas/termos" className="hover:text-amarelo">Termos de Serviço</Link></li>
            <li><Link href="/politicas/reembolso" className="hover:text-amarelo">Trocas e Reembolso</Link></li>
            <li><Link href="/politicas/envio" className="hover:text-amarelo">Envio e Entrega</Link></li>
            <li><Link href="/politicas/cookies" className="hover:text-amarelo">Politica de Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-60">
        © {new Date().getFullYear()} BrinqueTEAndo — Todos os direitos reservados.
      </div>
    </footer>
  );
}
