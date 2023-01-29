/* @refresh reload */
import {render} from "solid-js/web";
import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import "./index.css";

function App() {
	const [greetMsg, setGreetMsg] = createSignal("");
	const [name, setName] = createSignal("Nik4ant");

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
		setGreetMsg(await invoke("greet", { name: name() }));
	}

	return <>
		<div>
			<button class="btn btn-outline btn-info">Info</button>
			<button class="btn btn-outline btn-success" onclick={_ => greet()}>Success</button>
			<button class="btn btn-outline btn-success">{greetMsg()}</button>
		</div>
	</>
}

render(() => <App />, document.getElementById("root") as HTMLElement);
