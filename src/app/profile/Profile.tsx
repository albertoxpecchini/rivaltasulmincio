import Page from "@/app/lib/Page"
import html from "./profile.html?raw"
import script from "./profile.client.js?raw"

export default function Profile() {
  return <Page html={html} script={script} title={"Profilo – Rivalta sul Mincio"} description={""} />
}
