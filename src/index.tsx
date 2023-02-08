/* @refresh reload */
import {render} from "solid-js/web";
import {createSignal, For, Show} from "solid-js";
import "./index.css";


// Future TODO: Is it possible to share filestream with Rust? OR! Call Rust code everytime new line is added

function TextAreaEditor() {
	// How many previous lines is displayed above textarea
	const MAX_LINES_DISPLAYED = 4;
	// Maximum length for single line
	const MAX_LINE_LENGTH = 50;
	// Length at which textarea underline color changes to indicate approaching chars limit
	const WARNING_LINE_LENGTH = MAX_LINE_LENGTH - 8;
	
	//
	let wasCtrlPressedRecently: boolean = false;
	const [currentEditorLine, setCurrentEditorLine] = createSignal("");
	const [editorContentLines, setEditorContentLines] = createSignal<string[]>([]);
	const [isFocused, setIsFocused] = createSignal(false);
	// Function to format input (aka remove extra whitespaces)
	const formatInput = (value: string) => value.replace(/\s\s+/g, ' ').trim();
	// Derived signal for total words count
	// NOTE: This seems super inefficient, but I'll leave it for now and 
	// test later to see if this actually matters
	const totalWordsCount = () => {
		// Format current line
		let result = formatInput(currentEditorLine()).trimEnd().split(' ').length - 1;
		// Calculating words from previous lines
		for (const line of editorContentLines()) {
			result += line.split(' ').length;
		}
		return result;
	}
	
	function AppendLine(textAreaSource: HTMLTextAreaElement) {
		// Step 1. Format line from textarea
		const formattedLine = formatInput(textAreaSource.value);
		if (formattedLine.length === 0) {
			return;
		}
		// Step 2. Update lines
		setEditorContentLines([...editorContentLines(), formattedLine]);
		// Step 3. Clear textarea
		textAreaSource.value = '';
	}
	function onTextareaKeydown(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement; target: Element; }) {
		// Pasting text isn't allowed because it can mess up lines
		if (wasCtrlPressedRecently && e.key === 'v') {
			e.preventDefault();
		}
		// Changing from current line after
		else if (currentEditorLine().length > MAX_LINE_LENGTH || e.key === "Enter" || (e.key === ' ' && currentEditorLine().length > WARNING_LINE_LENGTH)) {
			AppendLine(e.currentTarget);
			e.currentTarget.value = '';
		}
		wasCtrlPressedRecently = e.ctrlKey;
	}

	const placeholderElement = <p class="editor-placeholder">Let your thoughts flow <i class="">mindlessly</i> like a river...</p> as HTMLParagraphElement;
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
	// style - sets width value to fit all characters (for details check out "ch" unit in css)
	// onInput - updates signal with current line
	// onkeydown - checks if current line should be "pushed back"
	const textAreaElement = <textarea rows="1" style={`width: ${MAX_LINE_LENGTH + 1}ch`} onkeydown={onTextareaKeydown} 
								onInput={e => setCurrentEditorLine(e.currentTarget.value)}
								class={`editor-text-field fade-in-transition ${currentEditorLine().length >= WARNING_LINE_LENGTH ? "editor-text-field-warning" : ''}`}></textarea> as HTMLTextAreaElement;
	// When focus from empty textarea is removed placeholder is displayed
	textAreaElement.addEventListener("focusout", (_) => {
		if (currentEditorLine().trim().length === 0) {
			setIsFocused(false);
			// Ensure that after focus change no whitespace characters are left after
			setCurrentEditorLine('');
			textAreaElement.value = '';
		}
	});

	return <>
		<div id="editor-text-field-container">
			<div>
				<For each={editorContentLines().slice(Math.max(editorContentLines().length - MAX_LINES_DISPLAYED, 0), editorContentLines().length)}>
				{(line, i, opacity_delta = Math.floor(100 / (MAX_LINES_DISPLAYED + 1))) => 
					<span class="editor-text" style={`opacity: ${opacity_delta * (i() + 1)}%`}>{line}<br /></span>
				}</For>
			</div>
			<Show when={isFocused()} fallback={placeholderElement}>
				{textAreaElement}
			</Show>
		</div>
		<p id="editor-word-count" class="editor-text text-center absolute bottom-8"><span class="opacity-60">Words:</span> {totalWordsCount()}</p>
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
