import { Button } from "@stonkerino/ui/shadcn/button";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24">
      <h1 className="text-center text-2xl font-bold border border-blue-700 p-10">
        Hello World!
      </h1>

      <p className="text-center text-lg font-bold border border-green-700 p-10">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>

      <Button variant="destructive">Click me</Button>

      <p className="prose">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.
      </p>
    </main>
  );
}
