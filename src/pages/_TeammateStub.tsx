interface StubProps {
  title: string;
  owner: string;
}

export default function TeammateStub({ title, owner }: StubProps) {
  return (
    <section>
      <div className="section-head">
        <div>
          <div className="eyebrow">COMING FROM {owner.toUpperCase()}'S BRANCH</div>
          <h2>{title.toUpperCase()}</h2>
        </div>
      </div>
      <div className="notice blue">
        This page is owned by {owner}. It'll appear here once their branch is merged.
      </div>
    </section>
  );
}