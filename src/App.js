import React from 'react';
import { CartesianGrid, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, } from 'recharts';
import xApiKey from './X_API_KEY.json';
import Strings from './Strings.json';

//====================================================================================
// static APIManager
//====================================================================================
// - RESAS APIを叩く静的クラスです
//====================================================================================
class APIManager{
	static baseUrl = 'https://opendata.resas-portal.go.jp/api/';
	static parseUrl(name){ return this.baseUrl + name; }
	static getAPI(name) {
		return new Promise((resolve, reject) => {
			try {
				fetch(this.parseUrl(name), { headers: { 'X-API-KEY': xApiKey.key }, }
				).then((res) => {
					if (res.status === 200){
						resolve(res.json());
					}else{
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
// PrefWrapper
//====================================================================================
// - 都道府県ごとの選択状況、人口データの取得、レンダリング用のオブジェクトを
//   生成するラッパークラスです
//====================================================================================
class PrefWrapper{
	static ColorList = ['red', 'blue', 'green', 'purple', 'orange', 'gray'];
	get id(){ return "key" + this.item.prefCode; }
	get name(){ return this.item.prefName; }
	get isChecked(){
		const el = document.querySelector(`input[name='prefs'][value=${this.id}]`);
		return el && el.checked === true;
	}
	constructor(parent, item){
		this.parent = parent;
		this.item = item;
		this.population = null;
	}
	getPopulation(){
		if (this.population === null){
			APIManager.getAPI(
				`v1/population/composition/perYear?cityCode=-&prefCode=${this.item.prefCode}`
			).then(
				(popl) => {
					this.population = popl.result;
					this.requestChange();
				}
			);
		}
		return this.population;
	}
	requestChange(){
		this.parent._changeSelection();
	}
	renderCheckbox(){
		return (
			<label key={this.id + '_label'} draggable="false">
				<input type="checkbox" name="prefs" onChange={this.requestChange.bind(this)} value={this.id}/>
				{this.name}
			</label>
		);
	}
	renderLine(i){
		return (
			<Line
				key={this.id + '_line'}
				dataKey={this.id}
				name={this.name}
				stroke={PrefWrapper.ColorList[i % PrefWrapper.ColorList.length]}
				type="monotone"
			/>
		);
	}
}

//====================================================================================
// PopulationModel
//====================================================================================
// - ステートの管理、グラフデータのフォーマット、レンダリングを行う
//   総合的なモデルクラスです
//====================================================================================
export default class PopulationModel extends React.Component{
	static value;
	constructor(props){
		super(props);
		this.state = {
			prefWrappers: [],
			graphData: [],
			selectedPrefs: []
		};
		this._changeSelection = this._onChange.bind(this);
	}
	componentDidMount(){
		if (this.state.prefWrappers.length > 0){
			return;
		}
		APIManager.getAPI('v1/prefectures').then(json => {
			this.setState({
				prefWrappers: json.result.map(pref => new PrefWrapper(this, pref))
			});
		});
	}
	_onChange(){
		this.formatGraphData();
	}
	formatGraphData(){
		const newGraph  = [];
		const newSelect = [];
		this.state.prefWrappers.forEach(pref=>{
			if (pref.isChecked === false){
				return;
			}
			const popl = pref.getPopulation();
			if (popl === null){
				return;
			}
			newSelect.push(pref);
			popl.data[0].data.forEach((json) => {
				const year = json.year;
				let yearObject = newGraph.find(obj => obj.year === year);
				if (yearObject === undefined){
					yearObject = {year: year};
					newGraph.push(yearObject);
				}
				yearObject[pref.id] = json.value;
			});
		});
		newGraph.sort((a, b) => a.year - b.year);
		this.setState({graphData: newGraph, selectedPrefs: newSelect});
	}
	render(){
		return (
			<div>
				<h2>{Strings.Title}</h2>
				{ this.state.prefWrappers.map(pref => pref.renderCheckbox()) }
				<ResponsiveContainer width="100%" height={500}>
					<LineChart
						width='800' height='400' data={this.state.graphData}
						margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
					>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis 
						dataKey="year"
						domain={['dataMin', 'dataMax']}
						label={{ value: Strings.LabelYear, offset: -5, position: "insideBottomRight" }}
					/>
					<YAxis
						domain={['dataMin', 'dataMax']}
						label={{ value: Strings.LabelPopulation, angle: -90, position: "insideLeft" }}
					/>
					<Tooltip />
					<Legend verticalAlign="top" />
					{ this.state.selectedPrefs.map((pref, i)=> pref.renderLine(i)) }
					</LineChart>
				</ResponsiveContainer>
			</div>
		);
	}
}