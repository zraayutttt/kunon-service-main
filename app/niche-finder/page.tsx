import NicheFinderForm from "@/components/forms/niche-finder-form";
import AppShell from "@/components/layout/AppShell";

export default function NicheFinderPage() {
  return (
    <AppShell
      title="Niche Finder"
      subtitle="Temukan ide video short berdasarkan keyword, wilayah, dan waktu."
    >
      <NicheFinderForm />
    </AppShell>
  );
}
