import Page from "@/app/lib/Page"
import html from "./post.html?raw"
import script from "./post.client.js?raw"

export default function Post() {
  return <Page html={html} script={script} title={"Articolo – Pro Loco Rivalta sul Mincio"} description={""} />
}
