import Page from "@/app/lib/Page"
import html from "./index.html?raw"
import script from "./index.client.js?raw"

export default function Home() {
  return <Page html={html} script={script} title={"Pro Loco Rivalta sul Mincio | Valli del Mincio, Festa del Pesce, Ecoturismo"} description={"Pro Loco Rivalta sul Mincio (Mantova): scopri le Valli del Mincio, la Festa del Pesce e del Luccio, l'ecoturismo, le sagre e le tradizioni del borgo nel cuore del Parco del Mincio. Eventi, escursioni, contatti."} />
}
