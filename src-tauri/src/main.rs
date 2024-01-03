// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use serde::{Serialize, Deserialize};
use std::fs::{File, metadata};
use std::io::{Write, Result, BufReader, BufRead};


#[derive(Serialize, Deserialize)]
struct Task {
    pub description: String,
    pub completed: bool
}

#[derive(Serialize, Deserialize)]
struct TaskList {
    pub tasks: Vec<Task>
}

impl TaskList {
    fn get_tasks(&self) -> &Vec<Task> {
        &self.tasks
    }

    fn add_task(&mut self, task: Task) {
        self.tasks.push(task);
        self.save_tasks("tasks.txt").expect("Failed to save tasks");
    }

    fn remove_task(&mut self, index: usize) {
        let index = if index <= 0 { 1000 } else { index - 1 };
        if index >= self.tasks.len() {
            return
        } else {
            self.tasks.remove(index);
        }
        self.save_tasks("tasks.txt").expect("Failed to save tasks");
    }

    fn complete_task(&mut self, index: usize) {
        let index = if index <= 0 { 1000 } else { index - 1 };
        if index >= self.tasks.len() {
            return
        } else {
            self.tasks[index].completed = !self.tasks[index].completed;
        }
        self.save_tasks("tasks.txt").expect("Failed to save tasks");
    }

    fn load_tasks(&mut self, filename: &str) -> Result<()> {
        if metadata(filename).is_err() {
            File::create(filename)?;
        }

        let file = File::open(filename)?;
        let reader = BufReader::new(file);
        self.tasks.clear();

        for line in reader.lines() {
            let line = line?;
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() == 2 {
                let description = parts[0].to_string();
                let completed = parts[1].parse::<bool>().unwrap_or(false);
                self.tasks.push(Task {description, completed});
            }
        }

        Ok(())   
    }

    fn save_tasks(&self, filename: &str) -> Result<()> {
        let mut file = File::create(filename)?;
        for task in &self.tasks {
            writeln!(&mut file, "{}\t{}", task.description, task.completed)?;
        }
        Ok(())
    }
}

#[tauri::command]
async fn get_tasks() -> String {
    let mut task_list = TaskList { tasks: vec![] };
    task_list.load_tasks("tasks.txt").expect("Failed to load tasks");
    serde_json::to_string(&task_list).expect("Failed to serialize tasks")
}

#[tauri::command]
async fn add_task(description: String) {
    let mut task_list = TaskList { tasks: vec![] };
    task_list.load_tasks("tasks.txt").expect("Failed to load tasks");
    task_list.add_task(Task { description, completed: false });
    task_list.save_tasks("tasks.txt").expect("Failed to save tasks");
}

#[tauri::command]
async fn remove_task(index: usize) {
    println!("Removing task {}", index);
    let mut task_list = TaskList { tasks: vec![] };
    task_list.load_tasks("tasks.txt").expect("Failed to load tasks");
    task_list.remove_task(index);
    task_list.save_tasks("tasks.txt").expect("Failed to save tasks");
}

#[tauri::command]
async fn complete_task(index: usize) {
    println!("Check/Uncheck task {}", index);
    let mut task_list = TaskList { tasks: vec![] };
    task_list.load_tasks("tasks.txt").expect("Failed to load tasks");
    task_list.complete_task(index);
    task_list.save_tasks("tasks.txt").expect("Failed to save tasks");
}

fn main() {
    let mut task_list = TaskList { tasks: vec![ Task { description: String::from("Task 1"), completed: false }, Task { description: String::from("Task 2"), completed: true }] };
    task_list.load_tasks("tasks.txt").expect("Failed to load tasks");
    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_tasks, add_task, remove_task, complete_task])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
