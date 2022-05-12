import React, { Component } from 'react';
const root = ReactDOM.createRoot(document.getElementById('main'));

function getAPI(name){
    return new Promise((resolve, reject) => {
        try{
            fetch('https://opendata.resas-portal.go.jp/' + name, {
                headers: { 'X-API-KEY': 'RWivhNbgzvzAoMy3QjG29zorNPDoqeFgeCADLZMt' },
            }).then((respond)=>{ resolve(respond.json()); });
        }catch (e){
            reject(null);
        }
    });
}

getAPI('api/v1/prefectures').then((json)=>{
    if (json != null){
            json.result.map(pref => { return <PrefButton>{pref}</PrefButton>; })
        root.render(
            (<LineChart
                width={400}
                height={400}
                data={data}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
            <XAxis dataKey="name" />
            <Tooltip />
                <CartesianGrid stroke="#f5f5f5" />
                <Line type="monotone" dataKey="uv" stroke="#ff7300" yAxisId={0} />
                <Line type="monotone" dataKey="pv" stroke="#387908" yAxisId={1} />
            </LineChart>)
        );
    }
});

class PrefButton extends React.Component{
    get _knsIsSelected(){ return this.state.value; }
    constructor(props) {
        super(props);
        this.state = {value: ''};
        this._knsItem = this.props.children;
        this._knsId = "pref" + this._knsItem.prefCode;
    }
    render(){
        return (
            <form>
                <label>
                    <input type="checkbox" name="pref" 
                        onChange={this.handleChange.bind(this)}
                        value={this._knsId}
                    />{this._knsItem.prefName}
                </label>
            </form>
        );
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }
}