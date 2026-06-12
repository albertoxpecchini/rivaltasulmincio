import Page from "@/app/lib/Page"
import html from "./cookie.html?raw"
import script from "./cookie.client.js?raw"

export default function Cookie() {
  return <Page html={html} script={script} title={"Cookie Policy — Rivalta sul Mincio"} description={""} />
}
