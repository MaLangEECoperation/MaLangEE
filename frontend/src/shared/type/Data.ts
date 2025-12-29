/**
 * 예제
 * const JOB = [
 *  { id: 'J01', name: 'PROGRAMMER', label: 'Programmer', value: '01' },
 *  { id: 'J02', name: 'DOCTOR', label: 'Doctor', value: '02' },
 *  { id: 'J03', name: 'TEACHER', label: 'Teacher', value: '03' },
 * ];
 *
 * 설명
 * id : 고유 값 - 외부에서 참조하는 값으로 언어레벨에서 사용함, 예 : onChangeValue(value) 에서 value 로 사용 후, 이 value로 데이터를 찾아서 처리함 - 이 값은 절대 바뀌지 않기에 언어레벨에서 사용함
 * name : 값에 접근하는 이름 - 프로그래머가 사용함,이 값은 합의에 의해 프론트에서 변경 가능, 예 : 상수 객체를 만들어서 JOB.DOCTOR 와 같이 사용함 ,이 DOCTOR가 name 임
 * label : 노출되는 이름 - 사용자에게 보여지는 이름, 예 : 화면에 노출되는 값, 이 값은 변경될 수 있음. 예 : '의사'
 * value : 실제 값 - 외부와 약속되는 값, 이 값은 언제든 변경될 수 있음, 외부와 공유하는 값으로 외부 요청에 의해 변경 가능함, 예 : 백엔드 api에서 '02'를 '002'로 임의로 변경하여도 프론트 코드에는 영향을 주지 않음. 왜냐하면 프론트는 이 값을 직접 참조하지 않기 때문.
 */

export type Data<D> = {
    id: string;
    name?: string;
    label?: string;
    value: D;
};
