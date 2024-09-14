import ObjectDetection from "../compoenent/objectdetection";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-black">
      <h1 className="gradient-title font-extrabold text-3xl md:text-6xl lg:text-8xl tracking-tighter md:px-6 text-center text-white">
        Thief Detection Alarm
      </h1>
      <ObjectDetection />
    </main>
  );
}