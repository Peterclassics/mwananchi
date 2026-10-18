import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
export default function AnalyticsCharts({ data }) {
  return (
    <div className="charts-grid">
      <section className="panel chart-panel">
        <h2>Resolution overview</h2>
        <p>Open = Pending + In Progress</p>
        {data.total ? (
          <>
            <div className="chart-area">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Open', value: data.open },
                      { name: 'Resolved', value: data.resolved },
                    ]}
                    innerRadius={65}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    <Cell fill="#eab66c" />
                    <Cell fill="#168474" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span>● Open: {data.open}</span>
              <span>● Resolved: {data.resolved}</span>
            </div>
          </>
        ) : (
          <p className="empty-chart">
            A chart will appear after the first request.
          </p>
        )}
      </section>
      <section className="panel chart-panel">
        <h2>Requests by category</h2>
        <p>All recorded requests</p>
        {data.categories.length ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data.categories}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#168474" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="empty-chart">Category totals will appear here.</p>
        )}
      </section>
    </div>
  );
}
