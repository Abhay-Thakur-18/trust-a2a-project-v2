export const parseReportSections = (report = "") => {
  if (!report?.trim()) return [];

  const lines = report.split("\n");
  const sections = [];
  let current = { title: "Overview", body: [] };

  lines.forEach((line) => {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      if (current.title || current.body.length) sections.push(current);
      current = { title: heading[1].trim(), body: [] };
      return;
    }
    current.body.push(line);
  });

  if (current.title || current.body.length) sections.push(current);

  return sections.map((section) => ({
    title: section.title,
    content: section.body.join("\n").trim(),
  })).filter((section) => section.content || section.title);
};

export const getScoreTone = (score) => {
  const value = Number(score || 0);
  if (value >= 80) return "success";
  if (value >= 60) return "warning";
  return "danger";
};

export const getReputationTone = (score) => {
  const value = Number(score || 0);
  if (value >= 85) return "success";
  if (value >= 60) return "warning";
  return "danger";
};
