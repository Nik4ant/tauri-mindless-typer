/* @refresh reload */
import {render} from "solid-js/web";
import {createSignal, For, Show} from "solid-js";
import "./index.css";


function TextAreaEditor() {
	// How many previous lines is displayed above textarea
	const MAX_LINES_DISPLAYED = 4;
	const MAX_LINE_LENGTH = 40;
	// NOTE: Change that to string[] and add extra one for current line
	const [currentEditorContent, setCurrentEditorContent] = createSignal("");
	const [displayedLines, setDisplayedLines] = createSignal<string[]>([]);
	const [isFocused, setIsFocused] = createSignal(false);
	// Function to format input (aka remove extra whitespaces)
	const formatInput = (value: string) => value.replace(/\s\s+/g, ' ').trim();
	const wordCount = () => -1;  // TODO:
	
	function AppendLine(line: string) {
		// Step 0. Format line from textarea
		const formattedLine = formatInput(line);
		if (formattedLine.length === 0) {
			return;
		}
		// Step 1. Update content
		setCurrentEditorContent(currentEditorContent() + '\n' + formattedLine);
		// Step 2. Update lines
		setDisplayedLines(currentEditorContent().split('\n'));
	}
	function onTextareaInput(e: InputEvent & {currentTarget: HTMLTextAreaElement; target: Element;}) {
		if (e.currentTarget.value.length > MAX_LINE_LENGTH) {
			AppendLine(e.currentTarget.value);
			e.currentTarget.value = '';
		}
	}
	function onTextareaKeydown(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement; target: Element; }) {
		// If enter was pressed adding new line
		if (e.key === "Enter") {
			AppendLine(e.currentTarget.value);
			e.currentTarget.value = '';
		}
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
			textAreaElement.focus();
		}, {once: true});

		placeholderElement.style.animation = fadeOutAnim;
	});
	// When focus from empty textarea is removed placeholder is displayed
	const textAreaElement = <textarea rows="1" style={`width: ${MAX_LINE_LENGTH + 1}ch`} class="editor-text-field fade-in-transition" onkeydown={onTextareaKeydown} onInput={onTextareaInput}></textarea> as HTMLTextAreaElement;
	textAreaElement.addEventListener("focusout", (_) => {
		if (currentEditorContent().trim().length === 0) {
			setIsFocused(false);
			// Ensure that after focus change no whitespace characters are left after
			setCurrentEditorContent('');
			textAreaElement.value = '';
		}
	});

	return <>
		<div id="editor-text-field-container">
			<div>
				<For each={displayedLines().slice(Math.max(displayedLines().length - MAX_LINES_DISPLAYED, 0), displayedLines().length)}>
				{(line, i, opacity_delta = Math.floor(100 / (MAX_LINES_DISPLAYED + 1))) => 
					<span class="editor-text" style={`opacity: ${opacity_delta * (i() + 1)}%`}>{line}<br /></span>
				}</For>
			</div>
			<Show when={isFocused()} fallback={placeholderElement}>
				{textAreaElement}
			</Show>
		</div>
		<p id="editor-word-count" class="editor-text text-center absolute bottom-8"><span class="opacity-60">Words:</span> {wordCount()}</p>
	</>
}

function App() {
	return <>
		<div class="flex flex-col space-y-2 items-center justify-center h-screen">
			<TextAreaEditor />
		</div>
	</>
}

render(() => <App />, document.getElementById("root") as HTMLElement);
