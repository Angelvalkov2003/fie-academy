import { VideoLibraryIndex } from "@/components/refereeing/Videos";
import { RefShell } from "@/components/Shell";

export const metadata = {
  title: "Video Library — Refereeing · FIE Fencing Academy",
};

export default function VideoLibraryPage() {
  return (
    <RefShell>
      <VideoLibraryIndex />
    </RefShell>
  );
}
