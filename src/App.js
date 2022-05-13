import React from 'react';
import { CartesianGrid, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, } from 'recharts';
import xApiKey from './X_API_KEY.json';
import Strings from './Strings.json';

//====================================================================================
// static APIManager
//====================================================================================
// - RESAS APIを叩く静的クラスです
//====================================================================================
class APIManager {
	static baseUrl = 'https://opendata.resas-portal.go.jp/api/';
	static parseUrl(name) { return this.baseUrl + name; }
	static getAPI(name) {
		return new Promise((resolve, reject) => {
			try {
				fetch(this.parseUrl(name), { headers: { 'X-API-KEY': xApiKey.key }, }
				).then((res) => {
					if (res.status === 200) {
						resolve(res.json());
					} else {
						throw Error(Strings.ApiConnectionFailed);
					}
				});
			} catch (e) {
				reject(null);
				throw e;
			}
		});
	}
}

//====================================================================================
// PrefController
//====================================================================================
// - 都道府県ごとの選択状況、人口データの取得、レンダリング用のオブジェクトを
//   生成するコントローラクラスです
//====================================================================================
class PrefController {
	static ColorList = ['red', 'blue', 'green', 'purple', 'orange', 'gray'];
	get id() { return "key" + this.item.prefCode; }
	get name() { return this.item.prefName; }
	get isChecked() {
		const el = document.querySelector(`input[name='prefs'][value=${this.id}]`);
		return el && el.checked === true;
	}
	constructor(parent, item) {
		this.parent = parent;
		this.item = item;
		this.population = null;
	}
	getPopulation() {
		if (this.population === null) {
			APIManager.getAPI(
				`v1/population/composition/perYear?cityCode=-&prefCode=${this.item.prefCode}`
			).then(
				(popl) => {
					this.population = popl.result;
					this.requestUpdate();
				}
			);
		}
		return this.population;
	}
	requestUpdate() {
		this.parent._changeSelection();
	}
	renderCheckbox() {
		return (
			<label key={this.id + '_label'}>
				<input type="checkbox" name="prefs" onChange={this.requestUpdate.bind(this)} value={this.id} />
				<span draggable="false">{this.name}</span>
			</label>
		);
	}
	renderLine(i) {
		const colors = PrefController.ColorList;
		return (
			<Line
				key={this.id + '_line'}
				dataKey={this.id}
				name={this.name}
				stroke={colors[i % colors.length]}
				type="monotone"
			/>
		);
	}
}

//====================================================================================
// GraphModel
//====================================================================================
// - グラフデータのフォーマット、レンダリング用のオブジェクトを
//   生成するモデルクラスです
//====================================================================================
class GraphModel {
	constructor() {
		this.graphData = [];
		this.selectedPrefs = [];
	}
	formatData(prefs) {
		this.graphData = [];
		this.selectedPrefs = [];
		prefs.forEach(pref => {
			if (pref.isChecked === false) { return; }
			const popl = pref.getPopulation();
			if (popl === null) { return; }
			this.selectedPrefs.push(pref);
			popl.data[0].data.forEach((json) => {
				const year = json.year;
				let yearObject = this.graphData.find(obj => obj.year === year);
				if (yearObject === undefined) {
					yearObject = { year: year };
					this.graphData.push(yearObject);
				}
				yearObject[pref.id] = json.value;
			});
		});
		return this.graphData.sort((a, b) => a.year - b.year);
	}
	renderGraph() {
		return (
			<ResponsiveContainer width="90%" height={400} >
				<LineChart
					width='800' height='400' data={this.graphData}
					margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="5 5" />
					<XAxis
						dataKey="year"
						domain={[1970, 2020]}
						allowDataOverflow={true}
						type="number"
						label={{ value: Strings.LabelYear, offset: -5, position: "insideBottomRight" }}
					/>
					<YAxis
						domain={[0, 8000000]}
						type="number"
						label={{ value: Strings.LabelPopulation, angle: -90, position: "insideLeft" }}
					/>
					<Tooltip />
					<Legend verticalAlign="top" />
					{this.selectedPrefs.map((pref, i) => pref.renderLine(i))}
				</LineChart>
			</ResponsiveContainer>
		);
	}
}

//====================================================================================
// MainView
//====================================================================================
// - 主画面のレンダリングを行うビュークラスです
//====================================================================================
export default class MainView extends React.Component {
	constructor(props) {
		super(props);
		this.state = { isDirty: false };
		this._prefControllers = [];
		this._graphModel = new GraphModel();
		this._changeSelection = this._onChange.bind(this);
	}
	componentDidMount() {
		if (this._prefControllers.length > 0) { return; }
		APIManager.getAPI('v1/prefectures').then(json => {
			this._prefControllers = json.result.map(
				item => new PrefController(this, item)
			);
			this.setState({ isDirty: true });
		});
	}
	_onChange() {
		this._graphModel.formatData(this._prefControllers);
		this.setState({ isDirty: true });
	}
	render() {
		return (
			<article className="poplModelArticle">
				<h1>{Strings.Header1}</h1>
				<div className="poplModelContents">
					<h2>{Strings.Header2}</h2>
					<div className="poplModelPrefs">
						{this._prefControllers.map(pref => pref.renderCheckbox())}
					</div>
					<hr />
					{this._graphModel.renderGraph()}
				</div>
			</article>
		);
	}
}