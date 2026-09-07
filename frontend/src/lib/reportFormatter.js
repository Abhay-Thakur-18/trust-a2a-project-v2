export const parseReportSections = (report = "") => {
  if (!report?.trim()) return [];

  const lines = report.split("\n");
  const sections = [];
  let current = { title: "Overview", body: [] };

  lines.forEach((line) => {
    const heading = line.match(/^#{1,3}\s+(.+)$/);
    if (heading) {
      const hasContent = current.body.some((l) => l.trim().length > 0);
      if (hasContent) {
        sections.push({
          title: current.title,
          content: current.body.join("\n").trim(),
        });
      }
      current = { title: heading[1].trim(), body: [] };
      return;
    }
    current.body.push(line);
  });

  const hasContent = current.body.some((l) => l.trim().length > 0);
  if (hasContent) {
    sections.push({
      title: current.title,
      content: current.body.join("\n").trim(),
    });
  }

  return sections.filter((section) => section.content && section.content.trim().length > 0);
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
