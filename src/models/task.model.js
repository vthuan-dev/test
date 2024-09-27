import { connection } from "../Database";
import BaseModel from "./base.model";

class TaskModel extends BaseModel {
  constructor() {
    super({
      table: "task",
      fillable: [
        "_id",
        "status",
        "description",
        "assign",
        "projectId",
        "updatedAt",
        "createdAt",
      ],
    });
  }
}

export default new TaskModel();
