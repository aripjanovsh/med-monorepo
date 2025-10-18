# 🔗 Интеграция Appointment с Visit

## Что нужно сделать

Когда feature Appointment будет создан, добавьте интеграцию с Visit для полного flow.

### 1. Добавить кнопку "Начать прием" в appointment-columns.tsx

```typescript
// В actions dropdown добавить условие:
{appointment.status === "SCHEDULED" || appointment.status === "IN_QUEUE" ? (
  <DropdownMenuItem onClick={() => handleStartVisit?.(appointment)}>
    <Stethoscope className="mr-2 h-4 w-4" />
    Начать прием
  </DropdownMenuItem>
) : null}
```

### 2. Создать handler в родительском компоненте

```typescript
import { useCreateVisitMutation } from "@/features/visit";
import { useRouter } from "next/navigation";

const [createVisit] = useCreateVisitMutation();
const router = useRouter();

const handleStartVisit = async (appointment: any) => {
  try {
    const visit = await createVisit({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      employeeId: appointment.employeeId,
      visitDate: new Date().toISOString(),
    }).unwrap();
    
    toast.success("Прием начат");
    router.push(`/cabinet/visits/${visit.id}`);
  } catch (error: any) {
    toast.error(error?.data?.message || "Ошибка при создании визита");
  }
};
```

### 3. Отобразить связанный Visit в деталях Appointment

```typescript
// В appointment detail page:
{appointment.visits && appointment.visits.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Связанные визиты</CardTitle>
    </CardHeader>
    <CardContent>
      {appointment.visits.map((visit) => (
        <div key={visit.id} className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {format(new Date(visit.visitDate), "dd.MM.yyyy HH:mm")}
            </p>
            <VisitStatusBadge status={visit.status} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/cabinet/visits/${visit.id}`)}
          >
            Открыть визит
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

## Автоматическое обновление статусов

Backend автоматически обновляет:
- При создании Visit → Appointment.status = "IN_PROGRESS"
- При завершении Visit → Appointment.status = "COMPLETED"

RTK Query автоматически обновит кэш благодаря invalidatesTags.

## Полный Flow

```
1. Reception создает Appointment через форму
   → Appointment.status = "SCHEDULED"

2. В день приема Reception меняет статус на "IN_QUEUE"

3. Doctor открывает список Appointments
   → Видит записи со статусом "IN_QUEUE"
   → Нажимает "Начать прием"

4. Создается Visit с appointmentId
   → Backend автоматически обновляет Appointment.status = "IN_PROGRESS"
   → Редирект на /cabinet/visits/{id}

5. Doctor заполняет информацию:
   → Добавляет назначения (Prescription)
   → Добавляет направления на анализы (LabOrder)

6. Doctor нажимает "Завершить прием"
   → Visit.status = "COMPLETED"
   → Backend автоматически обновляет Appointment.status = "COMPLETED"

7. История визита сохранена и доступна в деталях пациента
```

## Проверка работы

1. Создайте Appointment через API или форму
2. Смените статус на "IN_QUEUE"
3. Нажмите "Начать прием"
4. Проверьте что создался Visit
5. Добавьте Prescription и LabOrder
6. Завершите прием
7. Проверьте что Appointment.status = "COMPLETED"
