import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NoteService } from 'src/app/services/note.service';
import { Subscription } from 'rxjs';
import { Note } from 'src/app/services/@types/note';

@Component({
  selector: 'app-form-note',
  templateUrl: './form-note.component.html',
  styleUrls: ['./form-note.component.css'],
})
export class FormNoteComponent implements OnInit {
  title = 'FIAP NOTES';
  logoImage = '/assets/logo.png';

  checkoutForm: FormGroup;
  subscription: Subscription;

  noteToEdit = {} as Note;

  constructor(
    private formBuilder: FormBuilder,
    private noteService: NoteService
  ) {
    this.checkoutForm = this.formBuilder.group({
      textNote: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.subscription = this.noteService.editNoteProvider.subscribe({
      next: (note: Note) => {
        this.noteToEdit = note;
        this.checkoutForm.setValue({ textNote : note.text });
      },
      error: () => {}
    });
  }

  ngOnInit(): void {}

  sendNote() {
    if (this.checkoutForm.valid) {
      // se objeto noteToEdit possui id, significa que a ação de edição foi acionada
      const isEditAction = !!this.noteToEdit.id;
      if (isEditAction) {
        this.editNote();
      } else {
        this.sendNewNote();
      }
    }
  }

  sendNewNote() {
    this.noteService.postNotes(this.checkoutForm.value.textNote).subscribe({
      //next é chamado quando as coisas dão certo
      next: (note) => {
        this.checkoutForm.reset();
        this.noteService.notifyNewNoteAdded(note);
      },
      //error é chamado no caso de excessões
      error: (error) => alert("Algo errado na INSERÇÃO! " + error)
    });
  }

  editNote() { 
    this.noteToEdit.text = this.checkoutForm.value.textNote;    
    this.noteService.editNote(this.noteToEdit).subscribe({
      next: () => {
        this.checkoutForm.reset();
        this.noteToEdit = {} as Note;
      },
      //error é chamado no caso de excessões
      error: (error) => alert("Algo errado na EDIÇÃO! " + error),
      // usando complete para aplicar conceitos aprendidos
      complete: () => alert("Nota alterada com sucesso!")
    });
  }

  get textNote() {
    return this.checkoutForm.get('textNote');
  }
}
