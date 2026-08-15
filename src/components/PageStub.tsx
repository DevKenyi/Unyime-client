export default function PageStub({ title }: { title: string }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">This page is coming soon.</p>
      </div>
    </div>
  )
}
