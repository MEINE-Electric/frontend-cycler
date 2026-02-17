import Grid from "./components/Grid";
import Peripherals from "./components/Peripherals";

export default function Home() {
  return (
    <main className="bg-background overflow-hidden no-scrollbar text-foreground m-4 pt-2 flex flex-row">
      <Grid />
      <div className="w-[35vw] mx-4 h-fit no-scrollbar overflow-y-auto pl-12">
        <Peripherals />
      </div>
    </main>
  );
}
