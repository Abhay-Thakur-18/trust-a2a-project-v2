import AnalyticsCard from "./AnalyticsCard";

function AnalyticsGrid() {
  const data = [
    {
      title: "Pending",
      value: 4,
    },
    {
      title: "Completed",
      value: 21,
    },
    {
      title: "Escrow Locked",
      value: "$850",
    },
    {
      title: "Released",
      value: "$720",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mt-8">
      {data.map((item) => (
        <AnalyticsCard
          key={item.title}
          title={item.title}
          value={item.value}
        />
      ))}
    </div>
  );
}

export default AnalyticsGrid;