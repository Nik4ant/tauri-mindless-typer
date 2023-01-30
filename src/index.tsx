/* @refresh reload */
import {render} from "solid-js/web";
import {createSignal, Show} from "solid-js";
import "./index.css";

// TODO: having separate component for elements with ids feels kinda dumb
function TextArea() {
	const [currentContent, setCurrentContent] = createSignal("");
	const [isFocused, setIsFocused] = createSignal(false);
	
	// Note(Nik4ant): This type anotation looks kinda horrible not gona lie
	// TODO: proper onchange
	function onTextareaChanged(e: Event & {currentTarget: HTMLTextAreaElement;target: Element;}) {
		setCurrentContent(e.currentTarget.value)
	}

	const placeholderElement = <p class="editor-placeholder fade-in-transition">Let your thoughts flow <i>mindlessly</i> like a river...</p> as HTMLParagraphElement;
	placeholderElement.addEventListener("click", (_) => {
		// Waiting for placeholder fade out animation
		const initialAnimValue = placeholderElement.style.animation;
		const fadeOutAnim = "fade-out 0.5s ease-out";

		placeholderElement.addEventListener("animationend", (_) => {
			console.debug("Hello?!");
			placeholderElement.style.animation = initialAnimValue;
			// Changing focus
			setIsFocused(true);
			editableTextElement.focus();
		}, {once: true});

		placeholderElement.style.animation = fadeOutAnim;
	});

	const editableTextElement = <textarea rows="1" class="editor-text-field fade-in-transition" onchange={e => onTextareaChanged(e)}></textarea> as HTMLTextAreaElement;
	// Changing focus to determine if placeholder needs to be displayed
	editableTextElement.addEventListener("focusout", (_) => {
		setIsFocused(currentContent().length !== 0);
	});

	return <>
		<div id="editor-text-field-container">
			<Show when={isFocused()} fallback={placeholderElement}>
				{editableTextElement}
			</Show>
		</div>
		<p id="editor-word-count" class="editor-text absolute right-10 bottom-10"><span class="opacity-80">Words:</span> {currentContent().trimEnd().split(' ').length - 1}</p>
	</>
}

function App() {
	return <>
		<div class="flex items-center justify-center h-screen">
			<TextArea />
		</div>
	</>
}

render(() => <App />, document.getElementById("root") as HTMLElement);
