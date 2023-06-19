import Card from './components/Card'

export default function Home() {
  const iterations = Math.floor(Math.random() * 10) + 40;
  return (
    <>
      <Card iterations={iterations} />
    </>
  )
}
