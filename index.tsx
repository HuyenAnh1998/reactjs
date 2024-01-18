import type { VFC } from 'react'
import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// API
import type { ExternalEventRequest, ExternalEventUpfile } from 'api/organizer/external_event/types'
import type { ErrorHandler } from 'api/types'

// User Components
import { ExternalEventRegistUpdateTemplate } from 'components/organizer/templates/ExternalEvent/RegistUpdate'
import type { DialogContent } from 'components/organizer/templates/ExternalEvent/RegistUpdate'
import type { FormValues } from 'components/organizer/templates/ExternalEvent/RegistUpdate'

// Hooks
import { useToken } from 'hooks/organizer/auth/useToken'
import { useTransitionToError } from 'hooks/organizer/utils/useTransitionToError'
import { useLogout } from 'hooks/organizer/auth/useLogout'
import { useExternalEventDetail } from 'hooks/organizer/externalEvent/useExternalEventDetail'
import { useSeminarVideoisUploading } from 'hooks/organizer/seminarVideo/useSeminarVideoIsUploading'
import { useEventInfo } from 'hooks/organizer/event/useEventInfo'
import { useProfile } from 'hooks/organizer/profile/useProfile'
import { useCategoryList } from 'hooks/common/category/useCategoryList'

// Utils
import { format as formatDate } from 'date-fns'
import { dateToUnixTime } from 'utils/date'

// Constants
import { ROUTE } from 'constants/organizer/route'
import { CategoryEventActive } from 'constants/common/const'

export const ExternalEventRegistUpdate: VFC = () => {
  const navigate = useNavigate()

  const params = useParams<{ eventId?: string; serialId?: string }>()
  const eventId = params.eventId ? Number(params.eventId) : undefined
  const serialId = params.serialId ? Number(params.serialId) : undefined

  // ローディング
  const [isLoading, setLoading] = useState<boolean>(false)
  const isUploading = useSeminarVideoisUploading()

  const { t } = useTranslation(['common', 'organizer'])
  const [dialog, setDialog] = useState<DialogContent>()

  const [, getToken] = useToken()
  const error = useTransitionToError(window.location.href)
  const logout = useLogout()

  const errorHandler = useMemo<ErrorHandler>(
    () => ({
      onAuthError: logout,
      onValidationError: (e) => {
        if (
          e?.message === 'Related external event not exist' ||
          e?.message === 'related_external_event_id is invalid'
        ) {
          setDialog({
            title: `${t('common:dialog-error')}`,
            message: `${t('organizer:external-event/not-found')}`,
          })
        } else if (e?.message === 'Related external event has depended on other external event') {
          setDialog({
            title: `${t('common:dialog-error')}`,
            message: `${t('organizer:external-event/related-another-external-event')}`,
          })
        } else {
          // Other validation error
          const columns = e?.errors.map((error: any) => error.param)
          const msgs = e?.errors.map((error: any) => error.msg)

          if (columns) {
            const errMess = []
            if (columns.includes('title')) {
              errMess.push(`${t('organizer:external-event-register-update/title-invalid')}`)
            }

            if (columns.includes('detail')) {
              errMess.push(`${t('organizer:external-event-register-update/detail-invalid')}`)
            }

            if (columns.includes('event_place')) {
              errMess.push(`${t('organizer:external-event-register-update/event-place-invalid')}`)
            }

            if (columns.includes('additional_field_1')) {
              errMess.push(
                `${t('organizer:external-event-register-update/additional-field-1-invalid')}`
              )
            }
            if (columns.includes('additional_field_2')) {
              errMess.push(
                `${t('organizer:external-event-register-update/additional-field-2-invalid')}`
              )
            }
            if (columns.includes('additional_field_3')) {
              errMess.push(
                `${t('organizer:external-event-register-update/additional-field-3-invalid')}`
              )
            }
            if (columns.includes('additional_field_4')) {
              errMess.push(
                `${t('organizer:external-event-register-update/additional-field-4-invalid')}`
              )
            }
            if (columns.includes('additional_field_5')) {
              errMess.push(
                `${t('organizer:external-event-register-update/additional-field-5-invalid')}`
              )
            }
            if (columns.includes('upfile')) {
              if (msgs?.includes('upfile is not valid type')) {
                errMess.push(`${t('common:upfile-not-valid')}`)
              }
              if (msgs?.includes('upfile is too big, max file size is under 50MB')) {
                errMess.push(`${t('common:upfile-too-big-max-50MB')}`)
              }
            }

            if (columns.includes('start_date')) {
              errMess.push(`${t('organizer:external-event-register-update/start-date-invalid')}`)
            }

            if (columns.includes('end_date')) {
              errMess.push(`${t('organizer:external-event-register-update/end-date-invalid')}`)
            }

            if (columns.includes('display_start_date')) {
              errMess.push(
                `${t('organizer:external-event-register-update/display_start_date-invalid')}`
              )
            }

            if (columns.includes('display_end_date ')) {
              errMess.push(
                `${t('organizer:external-event-register-update/display_end_date-invalid')}`
              )
            }

            if (columns.includes('category')) {
              errMess.push(`${t('organizer:external-event-register-update/category-invalid')}`)
            }

            if (columns.includes('advance_registration')) {
              errMess.push(
                `${t('organizer:external-event-register-update/advance_registration-invalid')}`
              )
            }

            if (columns.includes('visibility')) {
              errMess.push(`${t('organizer:external-event-register-update/visibility-invalid')}`)
            }

            if (columns.includes('related_external_event_id')) {
              errMess.push(
                `${t('organizer:external-event-register-update/related_external_event_id-invalid')}`
              )
            }

            if (columns.includes('point_granting')) {
              errMess.push(
                `${t('organizer:external-event-register-update/point_granting-invalid')}`
              )
            }

            if (columns.includes('point_accumulation')) {
              errMess.push(
                `${t('organizer:external-event-register-update/point_accumulation-invalid')}`
              )
            }

            if (columns.includes('point_setting')) {
              errMess.push(`${t('organizer:external-event-register-update/point_setting-invalid')}`)
            }

            if (columns.includes('point_fixed_value')) {
              errMess.push(
                `${t('organizer:external-event-register-update/point_fixed_value-invalid')}`
              )
            }

            if (columns.includes('point_expiration_date')) {
              errMess.push(
                `${t('organizer:external-event-register-update/point_expiration_date-invalid')}`
              )
            }
            setDialog({
              title: `${t('common:dialog-error')}`,
              message: errMess.join('\n'),
            })
          } else {
            setDialog({
              title: `${t('common:dialog-error')}`,
              message: e?.errors.map((error) => error.msg).join('\n'),
            })
          }
        }
      },
      onOtherError: (e) => error(`${e.response?.status || 500}`),
      onNotFoundError: () => undefined,
    }),
    [logout, error, t]
  )

  const categoryList = useCategoryList({
    eventId,
    errorHandler,
    filter: { typeExternalEvent: CategoryEventActive.ACTIVE.VALUE },
    noUpdate: true,
  })

  const [detail, [register, update]] = useExternalEventDetail({
    eventId,
    serialId,
    errorHandler,
    getToken,
  })
  const [eventInfoState, event] = useEventInfo(params.eventId)
  const profile = useProfile({ getToken, errorHandler })

  // 登録・更新
  const onSubmit = useCallback(
    async (values: FormValues) => {
      const startDate = new Date(
        `${formatDate(values.startDate, 'yyyy/MM/dd')} ${values.startHour}:${values.startMinutes}`
      )
      const endDate = new Date(
        `${formatDate(values.endDate, 'yyyy/MM/dd')} ${values.endHour}:${values.endMinutes}`
      )
      const displayStartDate = new Date(
        `${formatDate(values.displayStartDate, 'yyyy/MM/dd')} ${values.displayStartHour}:${
          values.displayStartMinutes
        }`
      )
      const displayEndDate = new Date(
        `${formatDate(values.displayEndDate, 'yyyy/MM/dd')} ${values.displayEndHour}:${
          values.displayEndMinutes
        }`
      )
      const pointExpirationDate = values.pointExpirationDate
        ? dateToUnixTime(new Date(formatDate(values.pointExpirationDate, 'yyyy/MM/dd')))
        : null

      const category =
        !!values.category && values.category.length > 0 ? [parseInt(values.category)] : []

      const reqBody: ExternalEventRequest = {
        title: values.title,
        detail: values.detail,
        event_place: values.event_place,
        additional_field_1: values.additionalField1,
        additional_field_2: values.additionalField2,
        additional_field_3: values.additionalField3,
        additional_field_4: values.additionalField4,
        additional_field_5: values.additionalField5,
        start_date: dateToUnixTime(startDate),
        end_date: dateToUnixTime(endDate),
        display_start_date: dateToUnixTime(displayStartDate),
        display_end_date: dateToUnixTime(displayEndDate),
        category: category,
        advance_registration: values.advanceRegistration,
        visibility: values.visibility,
        related_external_event_id: values.relatedExternalEventId
          ? values.relatedExternalEventId
          : undefined,
        point_granting: values.pointGranting,
        point_accumulation: values.pointAccumulation,
        point_setting: values.pointSetting,
        point_fixed_value: values.pointFixedValue ? values.pointFixedValue : undefined,
        point_expiration_date: pointExpirationDate,
      }

      const thumbnail: ExternalEventUpfile | undefined = values.thumbnail.raw && {
        upfile: values.thumbnail.raw,
      }

      setLoading(true)
      try {
        if (serialId) {
          await update(reqBody, thumbnail)
        } else {
          await register(reqBody, thumbnail)
        }
        if (serialId) {
          navigate(
            ROUTE.EXTERNAL_EVENT_DETAIL.replace(':eventId', `${eventId}`).replace(
              ':serialId',
              `${serialId}`
            )
          )
        } else {
          navigate(ROUTE.EXTERNAL_EVENT.replace(':eventId', `${eventId}`))
        }
      } finally {
        setLoading(false)
      }
    },
    [serialId, register, update, navigate, eventId]
  )

  return (
    <ExternalEventRegistUpdateTemplate
      eventId={eventId}
      serialId={Number(serialId)}
      categories={categoryList || undefined}
      detail={detail}
      profile={profile}
      eventInfo={event.eventInfo}
      isBeforeStart={!eventInfoState?.error && event.isBeforeStart}
      onSubmit={onSubmit}
      setDialog={setDialog}
      isLoading={isLoading}
      isUploading={isUploading}
      dialog={dialog}
      logout={logout}
    />
  )
}
