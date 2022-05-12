import React from 'react';
import { LineChart, Line, Data, XAxis, Tooltip, CartesianGrid } from 'recharts';
import xApiKey from './X_API_KEY.json';

async function getAPI(name) {
	return new Promise((resolve, reject) => {
		try {
			fetch('https://opendata.resas-portal.go.jp/' + name, {
				headers: { 'X-API-KEY': xApiKey.key },
			}).then((res) => {
				if (res.status == 200){
					resolve(res.json());
				}else{
					throw '接続失敗';
				}
			});
		} catch (e) {
			reject(null);
			throw e;
		}
	});
}

/*
getAPI('api/v1/population/composition/perYear?cityCode=11362&prefCode=11').then((json) => {
	console.log(json);
});
*/

export default class App extends React.Component{
	static value;
	constructor(props){
		super(props);
		this.prefs = [];
		this.state = { dirty: false };
		this._changeSelection = this._onChange.bind(this);
	}
	componentDidMount(){
		if (this.prefs.length > 0){
			return;
		}
		getAPI('api/v1/prefectures').then(async json => {
			this.prefs = json.result.map(pref => new PrefWrapper(pref));
			this.setState({dirty: true});
		});
	}
	_onChange(){
		this.setState({dirty: false});
		console.log('changed', this.prefs.length);
	}
	render(){
		return (
			<div>
				{ this.prefs.map(pref => pref.toStr(this._changeSelection)) }
				<LineChart
					width={400}
					height={400}
					data={200}
					margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
				>
				<XAxis dataKey="name" />
				<Tooltip />
				<CartesianGrid stroke="#f5f5f5" />
				<Line type="monotone" dataKey="uv" stroke="#ff7300" yAxisId={0} />
				<Line type="monotone" dataKey="pv" stroke="#387908" yAxisId={1} />
				</LineChart>
			</div>
		);
	}
}

class PrefWrapper{
	constructor(item){
		this.item = item;
		this._isSelected = false;
	}
	toStr(onchange){
		return (
			<label key={this.id}>
				<input type="checkbox" name="prefs"
					onChange={onchange} value={id}
				/>{this.name}
			</label>
		);
	}
	get isSelected(){
		return this._isSelected;
	}
	get id(){
		return "key" + this.item.prefCode;
	}
	get name(){
		return this.item.prefName;
	}
}