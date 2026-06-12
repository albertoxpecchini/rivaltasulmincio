import Page from "@/app/lib/Page"
import html from "./origini.html?raw"
import script from "./origini.client.js?raw"

export default function Origini() {
  return <Page html={html} script={script} title={"Le Origini di Rivalta sul Mincio — Storia del borgo"} description={"La storia di Rivalta sul Mincio: dalle prime civiltà preromane sul Mincio, passando per il Medioevo gonzaghesco, la civiltà dell'acqua e le arelle, fino alla nascita della Pro Loco e della Festa del Pesce."} />
}
