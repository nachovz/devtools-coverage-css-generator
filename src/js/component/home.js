import React from "react";

//include images into your bundle
import rigoImage from "../../img/rigo-baby.jpg";

//create your first component
export class Home extends React.Component {
	constructor() {
		super();

		this.state = {
			coverage: "",
			css: 'Click "Extract CSS"',
			uncss: "",
			from: 0,
			to: 0
		};
	}

	generateCss = str => {
		const css_coverage = [...JSON.parse(str)];
		let css_used_bytes = 0;
		let css_total_bytes = 0;
		let covered_css = "";
		let uncovered_css = "";
		for (const entry of css_coverage) {
			if (entry.url.includes(".css")) {
				css_total_bytes += entry.text.length;
				uncovered_css += entry.text;
				console.log(
					`Total Bytes for ${entry.url}: ${entry.text.length}`
				);
				for (const range of entry.ranges) {
					// Fix indices due @media not being exported, see https://crbug.com/765088
					let mediaString = "";
					let mediaStart = entry.text.lastIndexOf("@media", range.start);
					if (mediaStart !== -1) {
						let mediaEnd = entry.text.indexOf("{", mediaStart);
						if (mediaEnd !== -1) {
							// Yeah, we found a previous @media rule
							if (!entry.text.slice(mediaStart, range.start).includes("}}")) {
								// ... but ensure it is not from another selector block, e.g
								// @media (min-width: 1200px) {
								//   .container {         <- might be from another range or not
								//     max-width:1140px
								//   }
								// }                      <- glad we have double closing }} here
								mediaString = entry.text.slice(mediaStart, mediaEnd);
							}
						}
					}
					css_used_bytes += range.end - range.start - 1 + mediaString.length;
					covered_css += mediaString + entry.text.slice(range.start, range.end);
					if (mediaString) {
						// Don't forget the closing bracket
						covered_css += "}";
					}
					uncovered_css = uncovered_css.replace(entry.text.slice(range.start, range.end), "");
				}
			}
		}
		this.setState({
			css: covered_css,
			uncss: uncovered_css,
			from: css_total_bytes,
			to: css_used_bytes
		});
	};

	render() {
		return (
			<div className="text-center mt-5">
				<h1>Coverage JSON to CSS converter</h1>
				<form
					onSubmit={e => {
						e.preventDefault();
						this.generateCss(this.state.coverage);
					}}>
					<div className="form-group">
						<label htmlFor="jsonTextArea">
							1. Paste JSON content
						</label>
						<textarea
							className="form-control"
							id="jsonTextArea"
							rows="5"
							value={this.state.coverage}
							onChange={e =>
								this.setState({ coverage: e.target.value })
							}
							placeholder="Paste JSON content here"
						/>
					</div>
					<button className="btn btn-info">2. Extract CSS</button>
				</form>
				<hr />
				<br />
				<div className="row">
					<div className="col col-md-6">
						<div className="form-group">
							<label htmlFor="jsonTextArea">Covered CSS</label>
							<textarea
								className="form-control"
								rows="10"
								style={{ whiteSpace: "pre" }}
								value={this.state.css}
								readOnly
							/>
						</div>
					</div>
					<div className="col col-md-6">
						<div className="form-group">
							<label htmlFor="jsonTextArea">Uncovered CSS</label>
							<textarea
								className="form-control"
								rows="10"
								style={{ whiteSpace: "pre" }}
								value={this.state.uncss}
								readOnly
							/>
						</div>
					</div>
				</div>
				<h2>
					Original: {this.state.from} | Covered:{" "}
					{this.state.css.length} | Uncovered:{" "}
					{this.state.uncss.length}
				</h2>
				<p>
					Made by{" "}
					<a href="http://www.4geeksacademy.com">4Geeks Academy</a>,
					with love!
				</p>
			</div>
		);
	}
}
