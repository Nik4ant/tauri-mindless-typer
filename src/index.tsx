/* @refresh reload */
import {render} from "solid-js/web";
import {createSignal, Show} from "solid-js";
import "./index.css";

// TODO: having separate component for elements with ids feels kinda dumb
function TextArea() {
	const [currentContent, setCurrentContent] = createSignal("");
	const [isFocused, setIsFocused] = createSignal(false);
	// Acounts for all combination of whitespace chars and initial content length
	const wordCount = () => currentContent().replace(/\s\s+/g, ' ').trimEnd().split(' ').length - Number(currentContent().length === 0);
	
	// Note(Nik4ant): This type anotation looks kinda horrible not gona lie
	// TODO: effect from original app
	function onTextareaInput(e: InputEvent & {currentTarget: HTMLTextAreaElement; target: Element;}) {
		setCurrentContent(e.currentTarget.value);
	}

	const placeholderElement = <p class="editor-placeholder">Let your thoughts flow <i>mindlessly</i> like a river...</p> as HTMLParagraphElement;
	// When placeholder is clicked it fades away and reveals editable textarea
	placeholderElement.addEventListener("click", (_) => {
		const initialAnimValue = placeholderElement.style.animation;
		const fadeOutAnim = "fade-out 0.5s ease-out";

		// Waiting for placeholder fade out animation
		placeholderElement.addEventListener("animationend", (_) => {
			placeholderElement.style.animation = initialAnimValue;
			// Changing focus
			setIsFocused(true);
			editableTextElement.focus();
		}, {once: true});

		placeholderElement.style.animation = fadeOutAnim;
	});
	// When focus from empty textarea is removed placeholder is displayed
	const editableTextElement = <textarea rows="1" class="editor-text-field fade-in-transition" oninput={onTextareaInput}></textarea> as HTMLTextAreaElement;
	editableTextElement.addEventListener("focusout", (_) => {
		if (currentContent().trim().length === 0) {
			setIsFocused(false);
			// Ensure that after focus change no whitespace characters are left after
			setCurrentContent('');
			editableTextElement.value = '';
		}
	});

	return <>
		<div id="editor-text-field-container">
			<Show when={isFocused()} fallback={placeholderElement}>
				{editableTextElement}
			</Show>
		</div>
		<p id="editor-word-count" class="editor-text text-center absolute bottom-8"><span class="opacity-60">Words:</span> {wordCount()}</p>
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
