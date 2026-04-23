import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Não foi encontrada a página para /apps/contribuicoes</h2>
      <p>Não foi possível localizar o recurso solicitado.</p>
      <Link href="/">Voltar ao início</Link>
    </div>
  );
}
