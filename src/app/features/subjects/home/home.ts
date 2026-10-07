import { Component, inject, OnInit, signal } from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MarkdownComponent } from 'ngx-markdown';
import { SubjectService } from '../subject-service';
import { Question, Subject } from '../subject';

type AnswerForm = FormGroup<{
  answer: FormControl<string>;
}>;

@Component({
  imports: [
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    MarkdownComponent,
    MatButtonModule,
    MatChipsModule,
    MatListModule,
    MatRadioModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private subjectService = inject(SubjectService);
  subjects = signal<Subject[]>([]);
  subjectSelected = signal<Subject | null>(null);
  subjectSelectedContent = signal<string | null>(null);
  questionsContent = new Map<string, Observable<string>>();
  selectedIndexTab = signal(0);

  quizForm = new FormGroup(
    {
      answers: new FormArray<AnswerForm>([])
    }
  );

  ngOnInit() {
    this.loadSubjects();
  }

  get answersFormArray(): FormArray<AnswerForm> {
    return this.quizForm.get('answers') as FormArray<AnswerForm>;
  }

  createAnswerForm(question: Question): AnswerForm {
    return new FormGroup({
      answer: new FormControl("", { nonNullable: true }),
    });
  }

  loadSubjects() {
    this.subjectService.getSubjects().subscribe({
      next: (response) => {
        this.subjects.set(response);
      },
      error: (error) => {
        console.error('Error fetching subjects:', error);
      }
    });
  }

  loadSubjectContent(): void {
    this.subjectService.getContent(this.subjectSelected()?.contentFile ?? "").subscribe({
      next: (response) => {
        this.subjectSelectedContent.set(response);
      },
      error: (error) => { console.error('Error fetching subject content', error); }
    });
  }

  loadQuestionContent(contentFile: string): Observable<string> {
    if (!this.questionsContent.has(contentFile)) {
      const content = this.subjectService.getContent(contentFile ?? "").pipe(
        map(response => response ?? ""),
        catchError(error => {
          console.error('Error fetching question content', error);
          return "";
        })
      );

      this.questionsContent.set(contentFile, content);
    }

    return this.questionsContent.get(contentFile)!;
  }

  setSubjectSelected(subject: Subject) {
    this.subjectSelected.set(subject);
    this.loadSubjectContent();
    this.answersFormArray.clear();
    this.quizForm.setControl(
      'answers',
      new FormArray<AnswerForm>(
        subject.questions.map(question => this.createAnswerForm(question))
      )
    );
    this.selectedIndexTab.set(0);
  }

  computeScore() {
    if (this.quizForm.invalid) {
      this.quizForm.markAllAsTouched();
      return;
    }

    if (this.subjectSelected()?.questions.length! == 0) {
      const dto = {
        name: this.subjectSelected()?.name,
        score: 100
      }

      this.subjectService.setSubject(dto).subscribe((response) => {
        alert("Pontuação: " + dto.score);
        this.loadSubjects();
        this.quizForm.reset();
      });

      return;
    }

    const correctAnswers = this.quizForm?.value?.answers?.filter(
      (item, index) => item.answer === this.subjectSelected()?.questions[index].answer
    ).length;

    if (correctAnswers != undefined) {
      const dto = {
        name: this.subjectSelected()?.name,
        score: correctAnswers / this.subjectSelected()?.questions.length! * 100
      }

      this.subjectService.setSubject(dto).subscribe((response) => {
        alert("Pontuação: " + dto.score);
        this.loadSubjects();
        this.quizForm.reset();
      });
    }
  }

  getScoreClass(score: number): string {
    if (score >= 90) {
      return 'score-good';
    }

    if (score >= 70) {
      return 'score-medium';
    }

    return 'score-bad';
  }

  verifyQuizFormReset(event: MatTabChangeEvent) {
    if (event.index == 0) {
      this.quizForm.reset();
    }
  }

  scrollToTop(): void {
    document.getElementById('sidenav-content')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
