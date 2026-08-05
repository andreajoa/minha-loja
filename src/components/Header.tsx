import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-teal text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          Brinque<span className="text-amarelo">TEA</span>ndo
        </Link>
        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-amarelo">Inicio</Link>
          <Link href="/colecoes" className="hover:text-amarelo">Coleçoes</Link>
          <Link href="/sobre" className="hover:text-amarelo">Sobre</Link>
          <Link href="/contato" className="hover:text-amarelo">Contato</Link>
          <Link href="/carrinho" className="hover:text-amarelo">Carrinho</Link>
        </nav>
      </div>
    </header>
  );
}
