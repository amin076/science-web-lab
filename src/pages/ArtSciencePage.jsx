import { Helmet } from "react-helmet-async";
import ImageMotionStudio from "@/components/artScience/ImageMotionStudio";

export default function ArtSciencePage() {
  return (
    <>
      <Helmet>
        <title>Art & Science | Esbiko</title>
        <meta
          name="description"
          content="Create cinematic science media scenes with Esbiko Art & Science tools."
        />
      </Helmet>
      <ImageMotionStudio />
    </>
  );
}
