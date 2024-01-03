import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import {
  Button,
  Col,
  Flex,
  FloatButton,
  Row,
  Input,
  List,
  notification,
  message,
} from "antd";
import {
  FaFile,
  FaMinus,
  FaMinusCircle,
  FaPlus,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [todos, setTodos] = useState([]);
  const [description, setDescription] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("simple_command", { name }));
  }

  async function getTodos() {
    try {
      const response = await invoke("get_tasks");
      const parsedResponse = JSON.parse(response);
      setTodos(parsedResponse.tasks);
      console.log(todos);
    } catch (error) {
      console.error(error);
    }
  }

  async function addTodo() {
    try {
      await invoke("add_task", { description });
      getTodos();
      setDescription("");
      message.open({
        type: "success",
        content: "ToDo Added",
        duration: 1.5,
      });
      // notification.open({
      //   message: "Task Added",
      //   description: "Your task was added successfully",
      //   placement: "bottomRight",
      //   duration: 1.5,
      // })
    } catch (error) {
      console.error(error);
    }
  }

  async function deleteTodo(id) {
    id = id + 1;
    try {
      await invoke("remove_task", { index: id });
      getTodos();
      message.open({
        type: "success",
        content: "ToDo Deleted",
        duration: 1.5,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function completeTodo(id) {
    id = id + 1;
    try {
      await invoke("complete_task", { index: id });
      getTodos();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <div className="container" style={{ width: "100%" }}>
      {/* <FloatButton type="primary" icon={<FaPlus />} tooltip="Add" onClick={() => getTodos()} /> */}
      <Row>
        <Col span={24}>
          <h1 style={{ textAlign: "center" }}>RustDo</h1>
        </Col>
      </Row>
      <Flex justify="center" align="center" style={{ marginBottom: "10px" }}>
        <Col span={12}>
          <Input
            placeholder="What needs to be done?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Col>
      </Flex>
      <Flex justify="center" align="center" style={{ marginBottom: "10px" }}>
        <Col span={2} offset={1}>
          <Button
            style={{
              verticalAlign: "middle",
              display: "flex",
              alignItems: "center",
            }}
            type="primary"
            shape="circle"
            onClick={() => addTodo()}
          >
            <FaPlus style={{ marginLeft: "8px" }} />
          </Button>
        </Col>
      </Flex>
      {/* TEST: {todos.map((todo) => (
            <div>{todo}</div>
          ))} */}
      <Flex direction="column" justify="center" align="center">
        <List
          // size="small"
          bordered
          style={{ width: "100%" }}
          dataSource={todos}
          renderItem={(item, index) => (
            <List.Item
              color="green"
              key={index}
              style={{
                textAlign: "start",
                display: "flex",
                alignItems: "center",
              }}
            >
              {item.completed ? (
                <FaCheckCircle
                  style={{ verticalAlign: "middle", marginRight: "8px" }}
                  color="lime"
                  onClick={() => completeTodo(index)}
                />
              ) : (
                <FaTimesCircle
                  style={{ verticalAlign: "middle", marginRight: "8px" }}
                  color="aqua"
                  onClick={() => completeTodo(index)}
                />
              )}
              {item.description}{" "}
              <FaMinusCircle
                style={{
                  verticalAlign: "middle",
                  marginLeft: "4px",
                  color: "red",
                }}
                onClick={() => deleteTodo(index)}
              />
            </List.Item>

            // <List.Item
            //   color="green"
            //   key={index}
            //   style={{ textAlign: "center", verticalAlign: "center" }}
            // >
            //   {item.description} -{" "}
            //   {item.completed ? (
            //     <FaCheckCircle
            //       style={{ verticalAlign: "middle", marginRight: "4px" }}
            //       color="lime"
            //       onClick={() => completeTodo(index)}
            //     />
            //   ) : (
            //     <FaTimesCircle
            //       style={{ verticalAlign: "middle", marginRight: "4px" }}
            //       color="aqua"
            //       onClick={() => completeTodo(index)}
            //     />
            //   )}{" "}
            //   <FaMinusCircle style={{ verticalAlign: "middle", marginRight: "4px" }} color="red" onClick={() => deleteTodo(index)} />
            // </List.Item>
          )}
        />
      </Flex>
    </div>
  );
}

export default App;
