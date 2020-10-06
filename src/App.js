import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import jwt_decode from "jwt-decode";
import {Button, Form} from 'react-bootstrap';
import PollPage from './poll'

async function fetchPolls(token, setPolls) {
	var header = new Headers();
	header.append("Authorization", "Bearer " + token);
  const response = await fetch("https://te2bakl9fb.execute-api.us-east-1.amazonaws.com/v1/polls", {
	method: "GET",
	headers: header
  });
  if (response.status == 200) {
	  const polls = await response.json();
	  setPolls(polls);
  }
}

const onSubmit = async (name, candidates, token, fetchPolls) => {
	name = name.value;
	candidates = candidates.value;

	var header = new Headers();
	header.append("Authorization", "Bearer " + token);
  const response = await fetch("https://te2bakl9fb.execute-api.us-east-1.amazonaws.com/v1/polls", {
	method: "POST",
	headers: header,
	body: JSON.stringify({
		name: name,
		candidates: candidates,
		expire_at: 123
	})
  });
  if (response.status == 200) {
	  const polls = await response.json();
	  fetchPolls();
  }
}

function NewPollPage(id_token, fetchPolls) {

	var name = '';
	var candidates = '';

	return (
		<div className="NewPollPage">
		<Form >
		<Form.Group style={{margin: 0}} controlId="formBasicEmail">
		  <Form.Label style={{fontSize: 17, color: 'white'}}>Poll Name</Form.Label>
		  <Form.Control ref={ref =>{name = ref;}} type="input" placeholder="" />
		</Form.Group>
		<Form.Group style={{margin: 0}} controlId="formBasicPassword">
		  <Form.Label style={{fontSize: 17, color: 'white'}}>Poll Candidates</Form.Label>
		  <Form.Control ref={ref =>{candidates = ref;}} type="input" placeholder="" />
		  <Form.Text style={{fontSize: 15, color: 'white'}} className="text-muted">
	        Separate candidates by comma
	      </Form.Text>
		</Form.Group>
		<Button variant="outline-info" onClick={() => onSubmit(name, candidates, id_token, fetchPolls)}>
		  Create New Poll
		</Button>
		</Form>
		</div>
	);
}

const selectPoll = (poll_id) => {
	console.log('touched' + poll_id);
};

function App() {

  	const frag = window.location.hash;

  	const params = frag.split('&')

	const [polls, setPolls] = useState([]);

	const [page, setPage] = useState(null);

	const [selectedPoll, setSelectedPoll] = useState(null);

	const [showNewPoll, setShowNewPoll] = useState(true);

	var id_token = ''
	for (var param of params){
		if (param.includes('id_token')){
			id_token = param.split('=')[1]
		}
	}

  	var decoded = jwt_decode(id_token);

	useEffect(() => {
		fetchPolls(id_token, setPolls);
	}, []);
	return (
		<div className="App">
		  <header className="App-header">
		    <p>
				Hi {decoded['name']}! <br />
		    </p>
			{NewPollPage(id_token, () => fetchPolls(id_token, setPolls))}
			<p><br />Here are your polls</p>
			{
				polls.map((item) => {
					return (
						<Button variant="outline-info" style={{marginBottom: 3, borderWidth: 0, backgroundColor: '#282c34'}} onClick={() => setSelectedPoll(item)}>
							{item.name}
						</Button>
					)
				})
			}
		  </header>
		  <div className="MainPage">
		  	<PollPage id_token={id_token} poll={selectedPoll} />
		  </div>
		</div>
	);
}

export default App;
