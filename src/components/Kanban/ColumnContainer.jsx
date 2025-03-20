import {TrashIcon} from './Icons.jsx'

export default function ColumnContainer({ column , deleteColumn }) {

  return (
    <div className="column">
      <div className="flex">
        <div className='titulo'>{column.title}</div>
        <button onClick={() => {deleteColumn(column.id)}}><TrashIcon/></button>
      </div>
      <div className='content'>Content</div>
      <div>Footer</div>
    </div>

  );
}