/* @refresh reload */
import {render} from "solid-js/web";
import {createSignal, For, Show} from "solid-js";
import { appWindow } from '@tauri-apps/api/window'
import "./index.css";


// Future TODO: Is it possible to share filestream with Rust? OR! Call Rust code everytime new line is added

function TextAreaEditor(props: { onLineBreak: (eventTarget: HTMLTextAreaElement) => void}) {
	// Maximum length for single line
	const MAX_AREA_LENGTH = 50;
	// Length at which textarea underline color changes to indicate approaching chars limit
	const WARNING_AREA_LENGTH = MAX_AREA_LENGTH - 8;
	// Flag to check for ctrl presses
	let wasCtrlPressedRecently: boolean = false;
	// Holds current line value that updates every time onInput occurs, which is more "accurate" than onkeydown
	const [currentAreaLine, setCurrentAreaLine] = createSignal("");
	const [isAreaFocused, setIsAreaFocused] = createSignal(false);
	
	function onTextareaKeydown(e: KeyboardEvent & { currentTarget: HTMLTextAreaElement; target: Element; }) {
		// Pasting text isn't allowed because it can mess up lines
		if (wasCtrlPressedRecently && e.key === 'v') {
			e.preventDefault();
		}
		// Changing from current line after
		else if (currentAreaLine().length > MAX_AREA_LENGTH || e.key === "Enter" || (e.key === ' ' && currentAreaLine().length > WARNING_AREA_LENGTH)) {
			props.onLineBreak(e.currentTarget);
		}
		wasCtrlPressedRecently = e.ctrlKey;
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
			setIsAreaFocused(true);
			textAreaElement.focus();
		}, {once: true});

		placeholderElement.style.animation = fadeOutAnim;
	});
	// style - sets width value to fit all characters (for details check out "ch" unit in css)
	// onInput - updates signal with current line
	// onkeydown - checks if current line should be "pushed back"
	const textAreaElement = <textarea rows="1" style={`width: ${currentAreaLine().length + 1}ch`} onkeydown={onTextareaKeydown} 
								onInput={e => setCurrentAreaLine(e.currentTarget.value)}
								class={`editor-text-field fade-in-transition ${currentAreaLine().length >= WARNING_AREA_LENGTH ? "editor-text-field-warning" : ''}`}></textarea> as HTMLTextAreaElement;
	// When focus from empty textarea is removed placeholder is displayed again
	textAreaElement.addEventListener("focusout", (_) => {
		if (currentAreaLine().trim().length === 0) {
			setIsAreaFocused(false);
			// Ensure that after focus change no whitespace characters are left after
			setCurrentAreaLine('');
			textAreaElement.value = '';
		}
	});

	return <>
		<div id="editor-text-field-container">
			<Show when={isAreaFocused()} fallback={placeholderElement}>
				{textAreaElement}
			</Show>
		</div>
	</>
}

function Editor() {
	// Word counter (gets updated whenever new line is added)
	const [totalWordsCount, setTotalWordsCount] = createSignal(0);
	// How many previous lines are displayed
	const MAX_LINES_DISPLAYED = 4;
	// Lines with different opacity values that are displayed above textarea
	const [displayedLines, setDisplayedLines] = createSignal<string[]>([]);

	function OnTextAreaLineBreak(eventTarget: HTMLTextAreaElement) {
		const formattedValue = eventTarget.value.replace(/\s\s+/g, ' ').trim();
		// 1) Update words counter
		setTotalWordsCount(totalWordsCount() + formattedValue.trimEnd().split(' ').length);
		// 2) Update lines
		let newLines = [...displayedLines(), formattedValue];
		if (newLines.length > MAX_LINES_DISPLAYED) {
			newLines.splice(0, 1);
		}
		setDisplayedLines(newLines);
		// 3) Clear textarea
		eventTarget.value = '';
	}

	return <>
		<div>
			<div>
				<For each={displayedLines()}>{(line, i, opacity_delta = Math.floor(100 / (MAX_LINES_DISPLAYED + 1))) =>
					<span class="editor-text" style={`opacity: ${opacity_delta * (i() + 1)}%`}>{line}<br /></span>
				}</For>
			</div>

			<TextAreaEditor onLineBreak={OnTextAreaLineBreak} />

			<p id="editor-word-count" class="editor-text text-center mt-2"><span class="opacity-60">Words:</span> {totalWordsCount()}</p>
		</div>
	</>
}


function App() {
	return <>
		<div class="flex flex-col space-y-2 items-center justify-center h-screen">
			<Editor />
		</div>
	</>
}

// Adding handlers to titlebar buttons
// Note: If I don't add "as HTMLElement" TS complains about possible null error
(document.getElementById('titlebar-minimize') as HTMLElement).addEventListener('click', () => appWindow.minimize());
(document.getElementById('titlebar-maximize') as HTMLElement).addEventListener('click', () => appWindow.toggleMaximize());
(document.getElementById('titlebar-close') as HTMLElement).addEventListener('click', () => appWindow.close());

render(() => <App />, document.getElementById("root") as HTMLElement);
