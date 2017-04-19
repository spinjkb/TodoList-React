import React, { Component } from 'react';
import './App.css';
import './login.css'
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import 'normalize.css';
import './reset.css';
// import * as localStore from './localStore'
import Login from './login';
import { getCurrentUser, signOut } from './leanCloud';
// import AV from 'leancloud-storage'

// var APP_ID = 'BiV7UkDq4HQzFs90TMrDMJcI-gzGzoHsz';
// var APP_KEY = '7AG8p7wyob46a5iXEoDqDsGe';
// AV.init({
//   appId: APP_ID,
//   appKey: APP_KEY
// });
// var TestObject = AV.Object.extend('TestObject');
// var testObject = new TestObject();
// testObject.save({
//   words: 'Hello World!',
//   name:'jkb'
// }).then(function(object) {
//   alert('LeanCloud Rocks!');
// })

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: getCurrentUser() || {},
      // user: {},
      newTodo: '',
      // todoList: localStore.load('todoList') || []
      todoList: []
    }
  }
  render() {
    let todos = this.state.todoList.filter((item) => !item.deleted).map((item, index) => {
      return (
        <li key={index}>
          <TodoItem todo={item}
            onToggle={this.toggle.bind(this)}
            onDelete={this.delete.bind(this)} />
        </li>
      )
    })
    return (
      <div className="App">
        <h1>{this.state.user.username || '我'}的待办
          {this.state.user.id ? <button onClick={this.signOut.bind(this)}>登出</button> : null}
        </h1>
        <div className="inputWrapper">
          <TodoInput content={this.state.newTodo}
            onChange={this.changeTitle.bind(this)}
            onSubmit={this.addTodo.bind(this)} />
        </div>
        <ol className="todoList">
          {todos}
        </ol>
        {this.state.user.username ? null : <Login onSignUp={this.onSignUp.bind(this)} />}
      </div>
    );
  }
  onSignUp(user) {
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    stateCopy.user = user
    this.setState(stateCopy)
  }
  signOut() {
    signOut()
    let stateCopy = JSON.parse(JSON.stringify(this.state))
    stateCopy.user = {}
    this.setState(stateCopy)
  }
  componentDidUpdate() {
    // localStore.save('todoList', this.state.todoList)
  }

  changeTitle(event) {
    this.setState({
      newTodo: event.target.value,
      todoList: this.state.todoList
    })
  }
  toggle(e, todo) {
    todo.status = todo.status === 'completed' ? '' : 'completed';
    this.setState(this.state)
  }
  delete(event, todo) {
    todo.deleted = true;
    this.setState(this.state)
  }
  addTodo(event) {
    if (event.target.value === '') {
      alert('请输入内容')
    } else {
      this.state.todoList.push({
        id: idMaker(),
        title: event.target.value,
        status: null,
        deleted: false
      })
      this.setState({
        newTodo: '',
        todoList: this.state.todoList
      })
    }

  }
}

export default App;

let id = 0
function idMaker() {
  id += 1
  return id
}