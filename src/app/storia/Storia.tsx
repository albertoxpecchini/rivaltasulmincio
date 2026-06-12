import Page from "@/app/lib/Page"
import html from "./storia.html?raw"
import script from "./storia.client.js?raw"

export default function Storia() {
  return <Page html={html} script={script} title={"La Storia del Sito — Rivalta sul Mincio"} description={"La cronologia completa del sito ufficiale della Pro Loco di Rivalta sul Mincio: funzioni, versioni, tecnologie e deployment in costante crescita."} />
}
