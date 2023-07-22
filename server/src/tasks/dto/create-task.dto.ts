export class CreateTaskDto {
  public content: string;
  public isCompleted: boolean;

  constructor() {
    this.content = '';
    this.isCompleted = false;
  }
}
