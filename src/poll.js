import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import jwt_decode from "jwt-decode";
import {Button, Form} from 'react-bootstrap';
import DataTable, { createTheme } from 'react-data-table-component';
import { scaleLinear } from 'd3-scale';
import { max } from 'd3-array';


async function fetchBallots(token, poll_id, setBallots) {
	var header = new Headers();
	header.append("Authorization", "Bearer " + token);
  const response = await fetch("https://te2bakl9fb.execute-api.us-east-1.amazonaws.com/v1/ballots?page=1&poll=" + poll_id, {
	method: "GET",
	headers: header
  });
  if (response.status == 200) {
	  const ballots = await response.json();
	  setBallots(ballots);
  }
}

createTheme('solarized', {
  text: {
    primary: '#222222',
    secondary: '#222222',
  },
  background: {
    default: '#eaeaea',
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#073642',
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
});


const adjustedTallies = (ballots) => {

	const votes = {}
	const num_voters = ballots.length / 3;
	for (var ballot of ballots) {
		let marks = ballot.marks
		for (var mark of marks) {
			if (!(mark in votes)) {
				votes[mark] = 0
			}
			votes[mark] += 1
		}
	}
	const tallies = [];
	for (var candidate in votes) {
		var tally = votes[candidate] - num_voters;
		tallies.push([candidate, tally]);
	}

	const yScale = scaleLinear()
         .domain([0, max(tallies.map(x => x[1]))])
         .range([0, 200])

	for (var i in tallies) {
		tallies[i] = [tallies[i][0], tallies[i][1], yScale(tallies[i][1])]
	}
	return tallies
};

const PollPage = ({id_token, poll}) => {
	const [ballots, setBallots] = useState([]);

	const columns = [
	  {
	    name: 'Ballot ID',
	    selector: 'id',
	    sortable: true,
	  },
	  {
	    name: 'Marked Candidates',
	    selector: r => r.marks.join(),
	    sortable: true,
	  },
	  {
	    name: 'Timestamp',
	    selector: 'timestamp',
	    sortable: true,
	  },
	];

	useEffect(() => {
		if (poll != null) {
			fetchBallots(id_token, poll.id, setBallots);
		}
	}, [poll]);

	return (
		<div className="PollPage">
			{
				poll == null ? poll : (
					<div className="BetweenBar" >
						<div style={{ marginLeft: 30, marginTop: 40, width: '50%'}}>
							<h1 style={{marginBottom: 20, textAlign: 'left', width: '100%', color: '#222222'}}>{poll.name}</h1>
							<p style={{marginBottom: 10, textAlign: 'left', width: '80%', fontSize: 15, color: '#222222'}}>Created by: {poll.created_by}</p>
							<p style={{marginBottom: 15, textAlign: 'left', width: '80%', fontSize: 15, color: '#222222'}}>Created on: {new Date(poll.timestamp * 1000).toLocaleDateString("en-US") + ' ' + new Date(poll.timestamp * 1000).toLocaleTimeString("en-US")}</p>
						</div>
						<div style={{marginLeft: 50, marginTop: 50, width: '50%'}}>
							<h4 style={{marginBottom: 20, textAlign: 'left', width: '100%', color: '#222222'}}>Adjusted Tallies</h4>
							{
								adjustedTallies(ballots).map((item) => {
									return (
										<div className="Bar">
											<p style={{textAlign: 'right', marginBottom: 5, height: 20, width: 150, fontSize: 15, color: '#222222'}}>{item[0]}:</p>
											<div style={{marginLeft: 10, backgroundColor: '#282c34', height: 20, width: item[2]}}>
												<p style={{marginRight: 10, textAlign: 'right', height: 20, fontSize: 15, color: '#ffffff'}}>{item[1]}</p>
											</div>
										</div>
									)
								})
							}
						</div>
					</div>
				)
			}
			<div style={{marginLeft: 0, width: "100%"}}>
				<DataTable
					theme="solarized"
					noDataComponent={<p style={{color: '#555555', fontSize: 18, marginBottom: 50}}>Select a poll to view ballots</p>}
					columns={columns}
					data={ballots}
					style={{backgroundColor: '#eaeaea'}}
				  />
			</div>
		</div>
	);
};

export default PollPage;
