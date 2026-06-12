import Page from "@/app/lib/Page"
import html from "./login.html?raw"
import script from "./login.client.js?raw"

export default function Login() {
  return <Page html={html} script={script} title={"Accedi | Rivalta sul Mincio"} description={""} />
}
